import {IAction} from "./IAction";
import {Actions} from "./Actions";

export class ActionAttackSecondary implements IAction {
    action: Actions = Actions.AttackSecondary;
    direction: number;
    combo: number;

    constructor(direction: number, combo: number) {
        this.direction = direction;
        this.combo = combo;
    }
}