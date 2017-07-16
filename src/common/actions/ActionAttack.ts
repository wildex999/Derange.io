
import {IAction} from "./IAction";
import {Actions} from "./Actions";

export class ActionAttack implements IAction {
    action: Actions = Actions.AttackPrimary;
    direction: number;

    constructor(direction: number) {
        this.direction = direction;
    }
}