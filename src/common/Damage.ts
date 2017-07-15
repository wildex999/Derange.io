
import {DamageType} from "./DamageType";

export class Damage {
    public amount: number;
    public type: DamageType;

    constructor(amount: number, type: DamageType) {
        this.amount = amount;
        this.type = type;
    }
}