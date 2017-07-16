
import {AttackSlashLargeCommon} from "../../common/attacks/AttackSlashLargeCommon";
import {World} from "../world";
import {Entity} from "../entities/Entity";
import * as p2js from "p2"
import {IDamageable} from "../../common/IDamageable";
import {Damage} from "../../common/Damage";
import {DamageType} from "../../common/DamageType";
import {PushMovement} from "../../common/movementmodifiers/PushMovement";
import {Vector} from "../../common/Vector";

export class AttackSlashLarge extends AttackSlashLargeCommon {
    body: p2js.Body;
    world: World;
    source: Entity;

    push = 80;
    damage = 3;

    constructor(world: World, source: Entity, angle: number, combo: number) {
        super(source, angle, combo);

        this.world = world;

        this.createBody(true);
        world.physicsWorld.addBody(this.body);
    }

    public setup() {
        super.setup();

        //Stop source from moving while attack is in progress
        let dx = Math.cos((this.angle-90) * Math.PI / 180);
        let dy = Math.sin((this.angle-90) * Math.PI / 180);

        let push = new Vector(dx * this.playerPush * (this.combo+1), dy * this.playerPush * (this.combo+1));

        let movement = new PushMovement(push, this.playerPushTime, this.playerStunTime);
        this.source.setMovementModifier(movement);
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