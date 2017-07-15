
import {Vector} from "../Vector";

export interface IEntity {
    setPosition(x: number, y: number);
    getPosition(): Vector;

    setVelocity(x: number, y: number);
    getVelocity(): Vector;
}