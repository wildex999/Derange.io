import {Actions} from "./Actions";
import {IAction} from "./IAction";

export class ActionMove implements IAction {
    public action = Actions.Move;
    public up: boolean;
    public down: boolean;
    public left: boolean;
    public right: boolean;

    constructor(up?: boolean, down?: boolean, left?: boolean, right?: boolean) {
        this.up = up;
        this.down = down;
        this.left = left;
        this.right = right;
    }
}