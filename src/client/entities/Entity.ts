
import {Vector} from "../../common/Vector";
import {Sync} from "../../common/sync/Sync";
import Sprite = Phaser.Sprite;
import {Game} from "../Game";
import {IGameObject} from "../IGameObject";
import {SyncedObject} from "../../common/sync/syncedobject";

import * as p2js from "p2"
import {TickStates} from "../../common/TickStates";
import {TickState} from "../../common/TickState";
import {GameMath} from "../../common/GameMath";
import {IRewindable} from "../IRewindable";
import Graphics = Phaser.Graphics;
import {Circle} from "p2";
import {IEntity} from "../../common/entities/IEntity";

@SyncedObject(null, "onSyncCreated", "onSyncUpdated", "onSyncDestroy")
export class Entity implements IGameObject, IEntity, IRewindable {
    instanceId: number;
    game: Game;
    body: p2js.Body;
    sprite: Sprite;
    serverGhost: Graphics;

    spriteOffsetX: number = 0;
    spriteOffsetY: number = 0;

    doInterpolate: boolean;
    serverPositions: TickStates<Vector>; //For interpolate

    @Sync("position")
    serverPosition: Vector;
    @Sync("velocity")
    serverVelocity: Vector;
    @Sync("canMove")
    serverCanMove: boolean;

    public init(game: Game) {
        this.game = game;

        this.sprite = game.add.sprite();

        this.body = new p2js.Body();
        this.body.mass = 1;
        this.body.fixedRotation = 0;
        this.body.damping = 0;
        (<any>this.body).parent = this;
        this.game.physicsWorld.addBody(this.body);

        this.game.layerMid.add(this.sprite);
        this.sprite.update = () => this.update();
        this.game.addObject(this);

        this.enableInterpolate();
    }

    public update() {
        this.showServerGhost(this.game.debugServerPosition);

        //Interpolate position from server positions
        if(this.doInterpolate) {
            this.interpolatePosition();
        }

        this.setPosition(this.body.position[0], this.body.position[1]); //float -> int
        this.sprite.x = this.body.position[0] + this.spriteOffsetX;
        this.sprite.y = this.body.position[1] + this.spriteOffsetY;
        if(this.serverGhost != null) {
            this.serverGhost.x = this.serverPosition.x;
            this.serverGhost.y = this.serverPosition.y;
        }
    }

    public destroy() {
        this.sprite.destroy();
        this.showServerGhost(false);

        this.game.physicsWorld.removeBody(this.body);
        this.game.removeObject(this);
    }

    public showServerGhost(show: boolean) {
        if(show) {
            if(this.serverGhost != null)
                return;

            let sphereSize = 10;
            if(this.body.shapes.length > 0) {
                sphereSize = this.body.shapes[0].boundingRadius * 2;
            }

            this.serverGhost = this.game.add.graphics();
            this.serverGhost.beginFill(0xFF0000);
            this.serverGhost.drawCircle(0, 0, sphereSize);
            this.game.layerMid.add(this.serverGhost);
        } else {
            if(this.serverGhost != null) {
                this.serverGhost.destroy();
                this.serverGhost = null;
            }
        }
    }

    public setPosition(x: number, y: number) {
        this.body.position[0] = GameMath.scale(x);
        this.body.position[1] = GameMath.scale(y);
    }

    public setVelocity(x: number, y: number) {
        this.body.velocity[0] = GameMath.scale(x);
        this.body.velocity[1] = GameMath.scale(y);
    }

    public getPosition(): Vector {
        return new Vector(this.body.position[0], this.body.position[1]);
    }

    public getVelocity(): Vector {
        return new Vector(this.body.velocity[0], this.body.velocity[1]);
    }

    public enableInterpolate() {
        this.doInterpolate = true;
        this.serverPositions = new TickStates<Vector>();
    }

    public disableInterpolate() {
        this.doInterpolate = false;
        this.serverPositions = null;
    }

    public rewind(tick: number) {
        //Override this to handle replay
    }

    interpolatePosition() {
        let syncTicks = this.game.syncTicks;
        let syncDelay = this.game.syncDelay;
        let currentTick = this.game.clientTick - (syncTicks * syncDelay);
        this.serverPositions.clearBefore(this.game.clientTick - (syncTicks * (syncDelay + 1))); //TODO: allow RTT*2 for rewind?

        if(this.serverPositions.size() == 0) {
            this.setPosition(this.serverPosition.x, this.serverPosition.y);
            return;
        }

        let stateFrom = this.serverPositions.getStateAt(currentTick, false);
        let stateTo = this.serverPositions.getStateAfter(currentTick);

        //Check if we have enough frames to interpolate
        if(stateFrom == null)
            stateFrom = this.serverPositions.getState(0);
        if(stateTo == null)
            stateTo = this.serverPositions.getState(this.serverPositions.size()-1);

        //console.log("StateFrom: " + stateFrom.tick + " StateTo: " + stateTo.tick + " Current: " + this.game.serverTick + " Client: " + this.game.clientTick);

        //Interpolate between states
        let xDiff = stateTo.state.x - stateFrom.state.x;
        let yDiff = stateTo.state.y - stateFrom.state.y;
        let tickDiff = stateTo.tick - stateFrom.tick;
        if(tickDiff <= 0)
            tickDiff = 1;

        let tickOffset = (currentTick - stateFrom.tick) / tickDiff;
        //console.log("Offset: " + tickOffset + " x: " + xDiff + " y: " + yDiff);
        this.setPosition(stateFrom.state.x + (xDiff * tickOffset), stateFrom.state.y + (yDiff * tickOffset));
    }

    onSyncCreated() {
        console.log("SYNC CREATED");
        this.setPosition(this.serverPosition.x, this.serverPosition.y);
    }

    onSyncUpdated() {
        if(this.doInterpolate) {
            let positionState = new Vector(this.serverPosition.x, this.serverPosition.y);
            this.serverPositions.addState(new TickState(this.game.serverTick, positionState));
        }
    }

    onSyncDestroy() {
        console.log("SYNC DESTROY");
    }

    onBeginContact(otherBody: p2js.Body, shape: p2js.Shape, otherShape: p2js.Shape) {
        console.log("CONTACT: " + (<any>this).syncObjectId);
    }
}