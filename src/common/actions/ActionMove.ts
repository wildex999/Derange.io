import {Actions} from "./Actions";
import {IAction} from "./IAction";

export class ActionMove implements IAction {
    public action = Actions.Move;
    public x: number;
    public y: number;
    public dash: boolean;

    constructor(x: number, y: number, dash: boolean) {
        this.x = x;
        this.y = y;
        this.dash = dash;
    }
}