
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
import {MovementModifier} from "../common/movementmodifiers/MovementModifier";
import {AttackSlashCommon} from "../common/attacks/AttackSlashCommon";
import {AttackSlashLargeCommon} from "../common/attacks/AttackSlashLargeCommon";
import {AttackSlashLarge} from "../server/attacks/AttackSlashLarge";
import {AttackSlashLargeSprite} from "./attacks/AttackSlashLargeSprite";
import {AttackSlashSprite} from "./attacks/AttackSlashSprite";
import {ActionAttackSecondary} from "../common/actions/ActionAttackSecondary";
import {Move} from "../common/models/gameobject/move";
import {ObjectSprite} from "./ObjectSprite";
import {IGameObject} from "./IGameObject";
import {Tags} from "../common/Tags";

@SyncedObject("Player")
export class PlayerClient extends Entity {
    @Sync()
    clientId: string;
    @Sync()
    actions: {[key: number]: IAction[]};

    isLocal: boolean;
    currentAttack: IAttack;
    dash: boolean;

    inputCooldown: number;

    onSyncCreated() {
        super.onSyncCreated();

        this.isLocal = this.clientId == this.game.client.clientId;
        this.inputCooldown = 0;
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
            //this.disableInterpolate();
            this.game.myCam.follow(this.sprite);
        }

    }


    update() {
        if(this.inputCooldown > 0)
            this.inputCooldown--;

        if(this.currentAttack != null) {
            if(!this.currentAttack.update())
                this.currentAttack = null;
        }

        //Perform actions from server
        for(let serverTick in this.actions) {
            let actions = this.actions[serverTick];
            for(let action of actions) {
                switch(action.action) {
                    case Actions.AttackPrimary:
                        let attackActionPrimary: ActionAttack = <ActionAttack>action;
                        let attack1 = new AttackSlash(this.game, new AttackSlashCommon(this, attackActionPrimary.direction), AttackSlashSprite);
                        this.setAttack(attack1);
                        break;
                    case Actions.AttackSecondary:
                        let attackActionSecondary: ActionAttackSecondary = <ActionAttackSecondary>action;
                        let attack2 = new AttackSlash(this.game, new AttackSlashLargeCommon(this, attackActionSecondary.direction, attackActionSecondary.combo), AttackSlashLargeSprite);
                        this.setAttack(attack2);
                        break;
                }
            }
        }
        this.actions = {};

        //Client input
        if(this.inputCooldown <= 0) {
            if (this.game.input.keyboard.isDown(Phaser.KeyCode.SPACEBAR))
                this.dash = true;
            if (this.game.input.mousePointer.leftButton.isDown)
                this.doClick(true);
            else if (this.game.input.mousePointer.rightButton.isDown)
                this.doClick(false);
        }

        super.update();
    }

    setAttack(attack: IAttack) {
        if(this.currentAttack != null)
            this.currentAttack.destroy();

        this.currentAttack = attack;

        if(this.currentAttack != null)
            this.currentAttack.createBody(false);
    }

    doClick(left: boolean) {
        let mx = this.game.input.mousePointer.x;
        let my = this.game.input.mousePointer.y;
        let clickPoint = this.game.myCam.screenToCamera(new Point(mx, my));

        //Check if we are attacking
        let target = this.game.input.activePointer.targetObject;
        if(target && target.sprite) {
            let sprite: ObjectSprite = target.sprite;
            let obj = sprite.object;

            if(obj != null && Tags.Has(obj.tags, Tags.Enemy)) {
                let type = left ? 0 : 1;
                this.game.doAttack((<Entity>obj).remoteInstanceId, type);
                return;
            }
        }

        //Move to location
        this.game.sendAction(new ActionMove(clickPoint.x, clickPoint.y, this.dash));

        if(this.dash)
            this.inputCooldown = 10;
        this.dash = false;
    }
}