import {Actions} from "./Actions";
import {IAction} from "./IAction";

export class ActionMove implements IAction {
    public action = Actions.Move;
    public x;
    public y;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}