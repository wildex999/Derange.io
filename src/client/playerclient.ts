
import {Sync} from "../common/sync/Sync";
import {SyncedObject} from "../common/sync/syncedobject";
import {Assets} from "./assets";
import {Entity} from "./Entity";
import {TickStates} from "../common/TickStates";
import {Vector} from "../common/Vector";
import {Keys} from "../common/Keys";

import * as p2js from "p2"
import {IAction} from "../common/IAction";
import {ActionMove} from "../common/actions/ActionMove";
import {Actions} from "../common/Actions";
import {TickState} from "../common/TickState";
import {GameMath} from "../common/GameMath";

@SyncedObject("Player")
export class PlayerClient extends Entity {
    actionMove: ActionMove;
    speed = 32;

    @Sync()
    clientId: string;

    //History
    clientPrediction: TickStates<PlayerState>; //For client prediction
    maxPredictError = 5; //How many pixels off it is allowed to be before redoing the prediction

    public isLocal: boolean;


    onSyncCreated() {
        super.onSyncCreated();

        this.isLocal = this.clientId == this.game.client.clientId;
        console.log("CREATED: " + this.isLocal);


        this.sprite.loadTexture(Assets.player.key);

        //this.pivot.set(8, 8);
        this.sprite.anchor.setTo(0.5, 0.5);
        this.spriteOffsetX = 1;
        this.spriteOffsetY = -5;

        //Collision
        let shape = new p2js.Circle({radius:5});
        if(this.isLocal)
            this.body.type = p2js.Body.DYNAMIC;
        else
            this.body.type = p2js.Body.STATIC;
        this.body.addShape(shape);

        /*this.d = this.game.add.graphics(this.body.position[0], this.body.position[1]);
        this.d.beginFill(0xFF0000, 1);
        this.d.drawCircle(0, -5, 10);
        this.game.myCam.add(this.d);*/

        if(this.isLocal) {
            this.disableInterpolate();
            this.game.myCam.follow(this.sprite);
            this.clientPrediction = new TickStates<PlayerState>();
            this.actionMove = new ActionMove();
        }

    }

    public update() {
        if(this.isLocal) {
            this.updateLocal();
            this.predictLocal();
        } else {
            //this.serverPosition.updateClient(this.game.clientTime);
            //console.log("Test: " + JSON.stringify(this.serverPosition.events));
            //console.log("MOVE: " + this.serverPosition.currentEvent.time + " > " + this.game.clientTime + " = " + this.serverPosition.x + " | " + this.serverPosition.y + " Delta: " + (this.serverPosition.x - this.x) + " | " + (this.serverPosition.y - this.y));
            //this.setPosition(this.serverPosition.x, this.serverPosition.y);
            this.updateRemote();
        }
        this.showServerGhost(this.game.debugServerPosition);

        super.update();
    }

    onSyncUpdated() {
        super.onSyncUpdated();

        if(this.isLocal) {
            this.clientPrediction.clearBefore(this.game.clientRemoteTick);

            let dx, dy;
            let predictedState = this.clientPrediction.getStateAt(this.game.clientRemoteTick, true);
            if(predictedState != null) {
                dx = predictedState.state.position.x - this.serverPosition.x;
                dy = predictedState.state.position.y - this.serverPosition.y;
                console.log("Compare " + this.game.serverTick + ": " + GameMath.scale(dx) + " | " + GameMath.scale(dy));
            }

            if(predictedState == null || (Math.abs(dx) + Math.abs(dy) > this.maxPredictError)) {
                this.setVelocity(this.serverVelocity.x, this.serverVelocity.y);
                this.setPosition(this.serverPosition.x, this.serverPosition.y);

                //Throw out prediction
                this.clientPrediction.clear();

                //TODO: Ask for rewind and replay with the new data
                //this.game.rewindToTick = this.game.clientRemoteTick;
                console.log("Error: " + dx + " | " + dy + " @ " + this.game.clientRemoteTick);
            }
        }
    }

    updateRemote() {
        //this.setVelocity(0, 0);
    }

    predictLocal() {
        let localTickState = this.clientPrediction.getStateAt(this.game.clientTick, true);
        if(localTickState == null) {
            console.log("WHAT? NO LOCAL PREDICTION? " + this.game.clientTick);
            return;
        }
        let localState = localTickState.state;

        this.setPosition(localState.position.x, localState.position.y);
        this.setVelocity(0,0);

        for(let action of localState.actions) {
            if(action.action == Actions.Move) {
                let moveAction: ActionMove = <ActionMove>action;

                let dx = 0;
                let dy = 0;
                if(moveAction.up)
                    dy -= this.speed;
                if(moveAction.down)
                    dy += this.speed;
                if(moveAction.left)
                    dx -= this.speed;
                if(moveAction.right)
                    dx += this.speed;

                this.setVelocity(dx, dy);
                //console.log("Move: " + this.game.clientTick + " Pos: " + this.getPosition().x + " | " + this.getPosition().y + " Vel: " + this.getVelocity().x + " | " + this.getVelocity().y);
            }
        }

        if(this.game.isReplaying) {
            console.log("Replay: " + this.game.clientTick + " Move: " + this.getPosition().x + " | " + this.getPosition().y + " Vel: " + this.getVelocity().x + " | " + this.getVelocity().y);
        }
    }

    updateLocal() {
        //Update the current local state
        if(!this.game.isReplaying) {
            let actionMove = this.actionMove;
            if(actionMove == null)
                actionMove = new ActionMove();
            actionMove.up = this.game.inputManager.isDown(Keys.Up);
            actionMove.down = this.game.inputManager.isDown(Keys.Down);
            actionMove.left = this.game.inputManager.isDown(Keys.Left);
            actionMove.right = this.game.inputManager.isDown(Keys.Right);
            if(actionMove.up || actionMove.down || actionMove.left || actionMove.right) {
                this.actionMove = actionMove;
                this.game.sendAction(this.actionMove);
            } else
                this.actionMove = null;

            this.storeState();
        } else {
            this.updateState();
        }


    }

    storeState() {
        let newState = new PlayerState();
        newState.position = this.getPosition();
        newState.velocity = this.getVelocity();
        newState.actions = [];

        if(this.actionMove)
            newState.actions.push(this.actionMove);

        //Set state at tick
        this.clientPrediction.addState(new TickState(this.game.clientTick, newState));
    }

    /**
     * Update predicted state during replay
     */
    updateState() {
        let state = this.clientPrediction.getStateAt(this.game.clientTick, true);
        if(state == null)
            return;

        state.state.position = this.getPosition();
        state.state.velocity = this.getVelocity();
    }
}

/**
 * Stored state at point in client prediction, used for rewind and replay to correction from server.
 */
class PlayerState {
    public position: Vector;
    public velocity: Vector;
    public actions: IAction[];
}