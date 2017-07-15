
export interface IAttack {
    attackId: string;

    update(): boolean; //Update the attack(Move it, the entity etc.). Returns false when the attack is done.
    destroy(); //End the attack early
}