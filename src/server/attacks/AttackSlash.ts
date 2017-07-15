
import {World} from "../world";
import * as p2js from "p2"
import {AttackSlashCommon} from "../../common/attacks/AttackSlashCommon";
import {Entity} from "../entities/Entity";
import {IAttack} from "../../common/attacks/IAttack";
import {IDamageable} from "../../common/IDamageable";
import {Damage} from "../../common/Damage";
import {DamageType} from "../../common/DamageType";

export class AttackSlash implements IAttack {
    public attackId = AttackSlashCommon.attackId;
    body: p2js.Body;
    life: number;

    world: World;
    source: Entity;
    angle: number;

    constructor(world: World, source: Entity, angle: number) {
        this.world = world;
        this.source = source;
        this.angle = angle;

        this.life = AttackSlashCommon.lifeTime;

        this.body = AttackSlashCommon.createBody(true);
        this.body.angle = angle * Math.PI / 180;
        this.body.position[0] = source.body.position[0];
        this.body.position[1] = source.body.position[1];
        (<any>this.body).parent = this;

        world.physicsWorld.addBody(this.body);
    }

    public update(): boolean {
        this.body.position[0] = this.source.body.position[0];
        this.body.position[1] = this.source.body.position[1];

        if(this.life-- == 0) {
            this.destroy();
            return false;
        }

        this.source.body.velocity[0] = Math.cos((this.angle-90) * Math.PI / 180) * 2;
        this.source.body.velocity[1] = Math.sin((this.angle-90) * Math.PI / 180) * 2;

        return true;
    }

    public destroy() {
        this.world.physicsWorld.removeBody(this.body);
    }

    onBeginContact(otherBody: p2js.Body, shape: p2js.Shape, otherShape: p2js.Shape) {
        let otherObj: any = (<any>otherBody).parent;
        if(!otherObj || !otherObj.onDamage)
            return;
        let otherDamageable: IDamageable = <IDamageable>otherObj;

        let damage = new Damage(3, DamageType.Slash);
        otherDamageable.onDamage(this, this.body.position[0], this.body.position[1], 300, [damage]);
    }
}