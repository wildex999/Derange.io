
import {Sync} from "../common/sync/Sync";
import {SyncedObject} from "../common/sync/syncedobject";
import {Sprite, CursorKeys} from "phaser-ce";
import {Game} from "./Game";
import {Move} from "../common/models/gameobject/move";
import {IGameObject} from "./IGameObject";
import {Assets} from "./assets";
import {SyncedMovement} from "../common/SyncedMovement";
import P2 = Phaser.Physics.P2;
import {Keys} from "./Keys";

@SyncedObject("Player", "onSyncCreated", "onSyncUpdate", "onSyncDestroy")
export class PlayerClient extends Sprite implements IGameObject{
    game: Game;
    body: P2.Body;

    isMoving: boolean;
    prevX: number;
    prevY: number;
    prevTime: number;


    @Sync()
    clientId: string;

    @Sync("position")
    serverPosition: SyncedMovement;

    public isLocal: boolean;

    public init(game: Game) {
        Phaser.Sprite.call(this, game, this.serverPosition.x, this.serverPosition.y, Assets.player.key);

        //this.pivot.set(8, 8);
        this.anchor.setTo(0.5, 0.5);

        this.game.layerMid.add(this);
    }

    public onSyncCreated() {
        console.log("CREATED: " + this.game);
        this.isLocal = this.clientId == this.game.client.clientId;

        if(this.isLocal) {
            this.game.physics.p2.enable(this);
            this.body.setZeroDamping();
            this.body.setZeroVelocity();
            this.body.setZeroRotation();
            this.body.setZeroForce();
            this.body.fixedRotation = true;

            //Set initial position
            this.serverPosition.updateClient(this.game.clientTime);
            this.body.reset(this.serverPosition.x, this.serverPosition.y, true, true);
            this.anchor.setTo(0.5, 0.5);

            //Collision
            this.body.setCircle(5, -1, 5);
            this.body.debug = true;
            this.game.myCam.add(this.body.debugBody);

            this.game.myCam.follow(this);
        } else {
            this.serverPosition.timeDelay = 100; //Allow for some lag

            //Set initial position
            this.serverPosition.updateClient(this.game.clientTime);
            this.x = this.serverPosition.x;
            this.y = this.serverPosition.y;
        }
    }

    public update() {
        if(this.isLocal)
            this.updateLocal();
        else {
            this.serverPosition.updateClient(this.game.clientTime);
            //console.log("Test: " + JSON.stringify(this.serverPosition.events));
            //console.log("MOVE: " + this.serverPosition.currentEvent.time + " > " + this.game.clientTime + " = " + this.serverPosition.x + " | " + this.serverPosition.y + " Delta: " + (this.serverPosition.x - this.x) + " | " + (this.serverPosition.y - this.y));
            this.x = this.serverPosition.x;
            this.y = this.serverPosition.y;
        }
    }

    public onSyncUpdate() {
        //console.log("SYNC: " + this.position.x);
        //TODO: If reported position deviates too much, correct(Hard reset?)
    }

    public onSyncDestroy() {
        console.log("DESTROY");
    }

    updateLocal() {
        //this.serverPosition.updateClient(this.game.clientTime); //TODO Correct client
        this.body.setZeroVelocity();
        this.body.setZeroForce();

        let wasMoving = this.isMoving;
        this.isMoving = false;

        let speed = 32;
        if(this.game.inputManager.isDown(Keys.Up)) {
            this.isMoving = true;
            this.body.moveUp(speed);
        }
        if(this.game.inputManager.isDown(Keys.Down)) {
            this.isMoving = true;
            this.body.moveDown(speed);
        }
        if(this.game.inputManager.isDown(Keys.Left)) {
            this.isMoving = true;
            this.body.moveLeft(speed);
        }
        if(this.game.inputManager.isDown(Keys.Right)) {
            this.isMoving = true;
            this.body.moveRight(speed);
        }

        if(this.isMoving) { //Send movement
            let timeMult = ((this.game.clientTime - this.prevTime) / 1000);
            let dx = (this.x - this.prevX) / timeMult;
            let dy = (this.y - this.prevY) / timeMult;
            this.game.doMove(new Move(this.prevX, this.prevY, dx, dy));
        } else if(wasMoving) //Send movement stop only once
            this.game.doMove(new Move(this.x, this.y, 0, 0));

        this.prevX = this.x;
        this.prevY = this.y;
        this.prevTime = this.game.clientTime;
    }

}