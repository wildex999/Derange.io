
import {SyncedObject} from "../../common/sync/syncedobject";
import {World} from "../world";
import {Entity} from "./entity";
import * as p2js from "p2";
import {Sync} from "../../common/sync/Sync";
import {IAttack} from "../../common/attacks/IAttack";
import {IDamageable} from "../../common/IDamageable";
import {Damage} from "../../common/Damage";
import {AttackSlashCommon} from "../../common/attacks/AttackSlashCommon";
import {CollisionGroups} from "../../common/CollisionGroups";
import {Vector} from "../../common/Vector";
import {MovementModifier} from "../../common/movementmodifiers/MovementModifier";
import {PushMovement} from "../../common/movementmodifiers/PushMovement";

@SyncedObject()
export class EnemyDummy extends Entity implements IDamageable {
    damageInvCounter = 0;
    damageInvTime = 10;
    health = 25;

    @Sync()
    damaged: boolean;

    constructor(world: World) {
        super(world);
    }

    public onDamage(attack: IAttack, x: number, y: number, push: number, damage: Damage[]) {
        if(this.damageInvCounter > 0)
            return;

        let dx = this.body.position[0] - x;
        let dy = this.body.position[1] - y;
        let mag = Math.sqrt((dx*dx) + (dy*dy));
        dx = dx/mag;
        dy = dy/mag;

        let pushMovement = new Vector(dx * push, dy * push);
        let movement = new PushMovement(pushMovement, 10, 10);
        this.setMovementModifier(movement);

        this.damageInvCounter = this.damageInvTime;

        for(let dmg of damage)
            this.health -= dmg.amount;
    }

    onCreated() {
        this.body.mass = 1;
        let shape = new p2js.Circle({radius:5});
        shape.collisionGroup = CollisionGroups.ENEMY;
        shape.collisionMask = CollisionGroups.ATTACK | CollisionGroups.TILE | CollisionGroups.ENEMY;
        this.body.type = p2js.Body.DYNAMIC;
        this.body.addShape(shape);

        super.onCreated();
    }

    onUpdate() {
        if(this.health <= 0) {
            this.world.removeEntity(this.instanceId);
            return;
        }

        this.preMovement();

        if(this.damageInvCounter > 0)
            this.damageInvCounter--;

        if(this.damageInvCounter > 0)
            this.damaged = true;
        else
            this.damaged = false;

        this.doMove();

        this.updateMovement();

        super.onUpdate();
    }

    doMove() {}

    onDestroy() {
        super.onDestroy();
    }
}