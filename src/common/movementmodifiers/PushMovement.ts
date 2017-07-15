
import {MovementModifier} from "./MovementModifier";
import {Entity} from "../../server/entities/Entity";
import {IEntity} from "../entities/IEntity";
import {Vector} from "../Vector";

export class PushMovement extends MovementModifier {
    entity: IEntity;
    pushAmount: Vector;
    pushTime: number;
    stunTime: number;

    /**
     *
     * @param {number} pushAmount Push force
     * @param {number} pushTime Time(Ticks) to apply the push
     * @param {number} stunTime How long to keep control(Stun entity)
     */
    constructor(pushAmount: Vector, pushTime: number, stunTime: number) {
        super();

        this.takeControl = stunTime > 0;

        pushAmount.x /= pushTime;
        pushAmount.y /= pushTime;
        this.pushAmount = pushAmount;

        this.pushTime = pushTime;
        this.stunTime = stunTime;
    }

    public onAdd(entity: IEntity) {
        this.entity = entity;
    }

    public onUpdate(): boolean {
        if(this.pushTime > 0) {
            let currentVelocity: Vector = this.entity.getVelocity();
            this.entity.setVelocity(currentVelocity.x + this.pushAmount.x, currentVelocity.y + this.pushAmount.y);
        }

        this.pushTime--;
        this.stunTime--;
        if(this.pushTime <= 0 && this.stunTime <= 0)
            return false;

        if(this.stunTime <= 0)
            this.takeControl = false;

        return true;
    }

    public onRemove() {

    }
}