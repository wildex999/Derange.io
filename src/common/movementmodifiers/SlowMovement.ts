
import {MovementModifier} from "./MovementModifier";
import {IEntity} from "../entities/IEntity";

export class SlowMovement extends MovementModifier {
    entity: IEntity;

    slowTime: number;
    slowAmount: number

    /**
     * Slow the current movement of an Entity
     * @param {number} slowTime How long to slow
     * @param {number} slowAmount How much to slow(How much to divide current velocity)
     */
    constructor(slowTime: number, slowAmount: number) {
        super();
        this.takeControl = false;
        this.slowTime = slowTime;
        this.slowAmount = slowAmount;
    }

    public onAdd(entity: IEntity) {
        this.entity = entity;
    }

    public onUpdate(): boolean {
        if(this.slowTime-- <= 0)
            return false;

        let vel = this.entity.getVelocity();
        this.entity.setVelocity(vel.x / this.slowAmount, vel.y / this.slowAmount);

        return true;
    }

    public onRemove() {

    }

    public clone(): MovementModifier {
        return new SlowMovement(this.slowTime, this.slowAmount);
    }
}