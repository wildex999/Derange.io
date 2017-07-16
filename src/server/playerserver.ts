import {Sync} from "../common/sync/Sync";
import {SyncedObject} from "../common/sync/syncedobject";
import {World} from "./world";
import {Entity} from "./entities/entity";

import * as p2js from "p2"
import {IAction} from "../common/actions/IAction";
import {Actions} from "../common/actions/Actions";
import {ActionMove} from "../common/actions/ActionMove";
import {PlayerCommon} from "../common/entities/PlayerCommon";
import {Vector} from "../common/Vector";
import {IGameObject} from "./IGameObject";
import {AttackSlash} from "./attacks/AttackSlash";
import {IAttack} from "../common/attacks/IAttack";
import {ActionAttack} from "../common/actions/ActionAttack";
import {AttackSlashLarge} from "./attacks/AttackSlashLarge";
import {ActionAttackSecondary} from "../common/actions/ActionAttackSecondary";

@SyncedObject("Player", null, null, null, "onSynced")
export class PlayerServer extends Entity {

    @Sync()
    clientId: string;
    @Sync()
    actions: {[key: number]: IAction[]}; //Actions synced with others(Attack etc.). Key: Tick number

    moveTo: Vector;
    speed = [25, 30, 40, 60];
    speedLevel = 0;
    moveCount = 0;

    attackTarget: IGameObject;
    attackType: number;
    attackRange = 20;

    currentAttack: IAttack;
    currentCombo = 0;
    comboCountdown = 0;

    constructor(clientId: string, world: World) {
        super(world);

        this.clientId = clientId;
    }

    public onCreated() {
        this.body.type = p2js.Body.DYNAMIC;
        PlayerCommon.createCollider(this.body);

        this.actions = {};

        super.onCreated();
    }

    public onUpdate() {
        this.preMovement();

        if (this.currentAttack != null) {
            if (!this.currentAttack.update())
                this.currentAttack = null;
        }
        if(this.comboCountdown-- <= 0) {
            this.comboCountdown = 0;
            this.currentCombo = 0;
        }

        if(this.attackTarget && this.currentAttack == null) {
            let target = <Entity>this.attackTarget;
            let targetPos = target.getPosition();
            let dist = this.distanceTo(targetPos.x, targetPos.y);

            if(dist > this.attackRange) {
                this.moveTo = targetPos;
            } else {
                //Attack
                let pos = this.getPosition();
                let angle = (Math.atan2(targetPos.y - pos.y, targetPos.x - pos.x)) * 180 / Math.PI;
                angle += 90;

                if(this.attackType == 0) {
                    this.setAttack(new AttackSlash(this.world, this, angle));
                    this.addSyncedAction(new ActionAttack(angle));
                } else if(this.attackType == 1) {
                    this.setAttack(new AttackSlashLarge(this.world, this, angle, this.currentCombo));
                    this.addSyncedAction(new ActionAttackSecondary(angle, this.currentCombo));
                    if(this.currentCombo < 3) {
                        this.currentCombo++;
                        this.comboCountdown = 60;
                    } else {
                        this.currentCombo = 0;
                        this.comboCountdown = 0;
                    }

                }

                this.moveTo = null;
                this.attackTarget = null;
            }
        }

        if(this.moveTo) {
            if(!this.moveTowards(this.moveTo.x, this.moveTo.y))
                this.moveTo = null;

            this.moveCount++;
            if(this.moveCount > 350)
                this.moveCount = 350;
        } else {
            this.moveCount-= 2;
            if(this.moveCount < 0)
                this.moveCount = 0;
        }

        if(this.moveCount > 300)
            this.speedLevel = 3;
        else if(this.moveCount > 150)
            this.speedLevel = 2;
        else if(this.moveCount > 50)
            this.speedLevel = 1;
        else
            this.speedLevel = 0;

        this.updateMovement();

        super.onUpdate();
    }

    public onAction(action: IAction) {
        if(action.action == Actions.Move) {
            let actionMove = <ActionMove>action;
            this.moveTo = new Vector(actionMove.x, actionMove.y);

            //Stop attacking if we get a move command
            this.attackTarget = null;
        }
    }

    public onAttackTarget(targetInstanceId: number, attackType: number) {
        this.attackTarget = this.world.entities[targetInstanceId];
        this.attackType = attackType;
    }

    onSynced() {
        this.actions = {};
    }

    addSyncedAction(action: IAction) {
        let tickActions: IAction[] = this.actions[this.world.currentTick];
        if (tickActions == null) {
            tickActions = [];
            this.actions[this.world.currentTick] = tickActions;
        }

        tickActions.push(action);
    }

    setAttack(attack: IAttack) {
        if(this.currentAttack != null)
            this.currentAttack.destroy();

        this.currentAttack = attack;
    }

    distanceTo(targetX: number, targetY: number) {
        let dx = targetX - this.body.position[0];
        let dy = targetY - this.body.position[1];
        return Math.sqrt((dx*dx) + (dy*dy));
    }

    /**
     * Move towards the target
     * @param {number} targetX
     * @param {number} targetY
     * @returns {boolean} False if it did not move(Already at target)
     */
    moveTowards(targetX: number, targetY: number): boolean {
        let dx = targetX - this.body.position[0];
        let dy = targetY - this.body.position[1];
        let mag = Math.sqrt((dx*dx) + (dy*dy));
        if(mag > 0.015) {
            dx = dx / mag;
            dy = dy / mag;

            this.setVelocity(dx * this.speed[this.speedLevel], dy * this.speed[this.speedLevel]);
            return true;
        }

        return false;
    }
}
