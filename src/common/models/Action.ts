
import {IAction} from "../actions/IAction";

export class Action implements Model {
    public static eventId = "Action";

    public action: IAction;

    constructor(action?: IAction) {
        this.action = action;
    }

    public getEventId(): string {
        return Action.eventId;
    }
}