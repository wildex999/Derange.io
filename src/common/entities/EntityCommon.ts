
import {IEntity} from "./IEntity";
import {MovementModifier} from "../movementmodifiers/MovementModifier";

export abstract class EntityCommon implements IEntity {
    movementModifier: MovementModifier;
    canMove: boolean;

    public abstract setPosition(x: number, y: number);
    public abstract getPosition();
    public abstract setVelocity(x: number, y: number);
    public abstract getVelocity();

    public setMovementModifier(modifier: MovementModifier) {
        if(this.movementModifier != null)
            this.movementModifier.onRemove();

        this.movementModifier = modifier;
        if(modifier != null)
            modifier.onAdd(this);
    }

    preMovement() {
        this.setVelocity(0,0);

        //Check if the Movement Modifier is stopping movement input
        if(this.movementModifier)
            this.canMove = !this.movementModifier.takeControl;
        else
            this.canMove = true;
    }

    updateMovement() {
        if(this.movementModifier != null) {
            if(!this.movementModifier.onUpdate()) {
                this.movementModifier.onRemove();
                this.movementModifier = null;
            }
        }
    }
}