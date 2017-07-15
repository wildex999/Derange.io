
import {Sync} from "../common/sync/Sync";
import {SyncedObject} from "../common/sync/syncedobject";
import {Assets} from "./assets";
import {Entity} from "./entities/Entity";
import {TickStates} from "../common/TickStates";
import {Vector} from "../common/Vector";
import {Keys} from "../common/Keys";

import * as p2js from "p2"
import {IAction} from "../common/actions/IAction";
import {ActionMove} from "../common/actions/ActionMove";
import {Actions} from "../common/actions/Actions";
import {TickState} from "../common/TickState";
import {GameMath} from "../common/GameMath";
import Sprite = Phaser.Sprite;
import {AttackSlash} from "./attacks/AttackSlash";
import Point = Phaser.Point;
import {PlayerCommon} from "../common/entities/PlayerCommon";
import {ActionAttack} from "../common/actions/ActionAttack";
import {IAttack} from "../common/attacks/IAttack";

@SyncedObject("Player")
export class PlayerClient extends Entity {
    actionAttack: ActionAttack;
    actionMove: ActionMove;
    speed = 32;

    currentAttack: IAttack;

    @Sync()
    clientId: string;
    @Sync()
    actions: {[key: number]: IAction[]};

    //History
    clientPrediction: TickStates<PlayerState>; //For client prediction
    maxPredictError = 5; //How many pixels off the prediction is allowed to be before discarding it

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
        if(this.isLocal)
            this.body.type = p2js.Body.DYNAMIC;
        else
            this.body.type = p2js.Body.STATIC;
        PlayerCommon.createCollider(this.body);

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
        }

        if(this.currentAttack != null) {
            if(!this.currentAttack.update())
                this.currentAttack = null;
        }

        super.update();
    }

    onSyncUpdated() {
        super.onSyncUpdated();

        if(this.isLocal) {
            this.clientPrediction.clearBefore(this.game.clientRemoteTick);

            let dx, dy;
            let predictedState = this.clientPrediction.getStateAt(this.game.clientRemoteTick, true);
            //console.log("Test: " + JSON.stringify(this.clientPrediction) + " | " + this.game.clientRemoteTick);
            if(predictedState != null) {
                dx = predictedState.state.position.x - this.serverPosition.x;
                dy = predictedState.state.position.y - this.serverPosition.y;
                //console.log("Compare " + this.game.serverTick + ": " + GameMath.scale(dx) + " | " + GameMath.scale(dy));
            }

            if(predictedState == null || (Math.abs(dx) + Math.abs(dy) > this.maxPredictError)) {
                this.setVelocity(this.serverVelocity.x, this.serverVelocity.y);
                this.setPosition(this.serverPosition.x, this.serverPosition.y);

                //Throw out prediction
                if(predictedState != null)
                    this.clientPrediction.clear();

                //TODO: Ask for rewind and replay with the new data
                //this.game.rewindToTick = this.game.clientRemoteTick;
                console.log("Error: " + dx + " | " + dy + " @ " + this.game.clientRemoteTick);
            }
        } else {
            //Apply remote actions
            for(let actionTick in this.actions) {
                let tickActions: IAction[] = this.actions[actionTick];
                //TODO: Take into account what tick the action was started(relative)
                for(let action of tickActions) {
                    switch (action.action) {
                        case Actions.Attack:
                            let attackAction: ActionAttack = <ActionAttack>action;
                            let attack = new AttackSlash(this.game, this, attackAction.direction);
                            this.setCurrentAttack(attack);
                            break;
                    }
                }
            }
        }
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
            switch(action.action) {
                case Actions.Move:
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
                    break;

                case Actions.Attack:
                    let attackAction: ActionAttack = <ActionAttack>action;
                    let attack = new AttackSlash(this.game, this, attackAction.direction);
                    this.setCurrentAttack(attack);
                    break;
            }

        }

        if(this.game.isReplaying) {
            console.log("Replay: " + this.game.clientTick + " Move: " + this.getPosition().x + " | " + this.getPosition().y + " Vel: " + this.getVelocity().x + " | " + this.getVelocity().y);
        }
    }

    updateLocal() {
        //Update the current local state
        if(!this.game.isReplaying) {
            //Update movement
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

            //Update attack
            this.actionAttack = null;
            if(this.currentAttack == null) {
                if (this.game.input.mousePointer.leftButton.justPressed()) {
                    let clickPoint = new Point(this.game.input.mousePointer.x, this.game.input.mousePointer.y);
                    let attackPoint = this.game.myCam.screenToCamera(clickPoint);

                    let angle = Phaser.Math.angleBetweenPoints(this.sprite.position, attackPoint) * 180 / Math.PI;
                    angle += 90;
                    //console.log("Angle: " + angle);

                    this.actionAttack = new ActionAttack(angle);
                    this.game.sendAction(this.actionAttack);
                }
            }

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
        if(this.actionAttack)
            newState.actions.push(this.actionAttack);

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

    setCurrentAttack(attack: IAttack) {
        if(this.currentAttack != null)
            this.currentAttack.destroy();
        this.currentAttack = attack;
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