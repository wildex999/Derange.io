
import {SyncedObject} from "../../common/sync/syncedobject";
import {Entity} from "./Entity";
import {Assets} from "../assets";
import * as p2js from "p2";
import {Sync} from "../../common/sync/Sync";
import {IDamageable} from "../../common/IDamageable";
import {Damage} from "../../common/Damage";
import {IAttack} from "../../common/attacks/IAttack";
import {TickState} from "../../common/TickState";
import {TickStates} from "../../common/TickStates";
import {Tags} from "../../common/Tags";

@SyncedObject()
export class EnemyDummy extends Entity implements IDamageable {

    @Sync("damaged")
    serverDamaged: boolean;

    serverStates: TickStates<boolean>;
    damaged: boolean;

    constructor() {
        super();

        this.tags.push(Tags.Enemy);
    }

    public onDamage(attack: IAttack, x: number, y: number, push: number, damage: Damage[]) {
        //TODO: Show damage number
    }

    onSyncCreated() {
        super.onSyncCreated();

        this.serverStates = new TickStates<boolean>();

        this.sprite.loadTexture(Assets.enemy.key);

        //this.pivot.set(8, 8);
        this.sprite.anchor.setTo(0.5, 0.5);
        this.spriteOffsetX = -3;
        this.spriteOffsetY = -5;

        this.sprite.inputEnabled = true;
        //this.sprite.events.onInputOver
        //this.sprite.events.onInputDown.add(this.onClick, this);
    }

    update() {
        this.serverStates.clearBefore(this.getClearServerStatesBeforeTick());
        let currentState = this.serverStates.getStateAt(this.getSimulateTick(), false);
        if(currentState != null)
            this.damaged = currentState.state;

        if(this.damaged)
            this.sprite.tint = 0xFF0000;
        else
            this.sprite.tint = 0xFFFFFF;

        super.update();
    }

    onSyncUpdated() {
        this.serverStates.addState(new TickState<boolean>(this.game.serverTick, this.serverDamaged));

        super.onSyncUpdated();
    }
}