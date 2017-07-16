
import {AttackSlashLargeCommon} from "../../common/attacks/AttackSlashLargeCommon";
import {World} from "../world";
import {Entity} from "../entities/Entity";
import * as p2js from "p2"
import {IDamageable} from "../../common/IDamageable";
import {Damage} from "../../common/Damage";
import {DamageType} from "../../common/DamageType";

export class AttackSlashLarge extends AttackSlashLargeCommon {
    body: p2js.Body;
    world: World;

    push = 80;
    damage = 3;

    constructor(world: World, source: Entity, angle: number, combo: number) {
        super(source, angle, combo);

        this.world = world;

        this.createBody(true);
        world.physicsWorld.addBody(this.body);
    }

    public destroy() {
        this.world.physicsWorld.removeBody(this.body);
    }

    onBeginContact(otherBody: p2js.Body, shape: p2js.Shape, otherShape: p2js.Shape) {
        let otherObj: any = (<any>otherBody).parent;
        if(!otherObj || !otherObj.onDamage)
            return;
        let otherDamageable: IDamageable = <IDamageable>otherObj;

        let damage = new Damage(this.damage, DamageType.Slash);
        otherDamageable.onDamage(this, this.body.position[0], this.body.position[1], this.push, [damage]);
    }
}