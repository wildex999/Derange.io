
import {Vector} from "../Vector";

export interface IAttack {
    attackId: string;

    createBody(includeCollide: boolean);
    update(): boolean; //Update the attack(Move it, the entity etc.). Returns false when the attack is done.
    destroy(); //End the attack early

    getPosition(): Vector;

}