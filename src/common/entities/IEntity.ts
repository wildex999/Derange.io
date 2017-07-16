
import {Vector} from "../Vector";
import {MovementModifier} from "../movementmodifiers/MovementModifier";

export interface IEntity {
    setPosition(x: number, y: number);
    getPosition(): Vector;

    setVelocity(x: number, y: number);
    getVelocity(): Vector;
}