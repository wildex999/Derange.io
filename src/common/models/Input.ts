///<reference path="model.ts"/>

export class Input implements Model {
    public static eventId: string = "clientInput";

    public inputChange: {[key: number]: boolean}; //Key: Keys enum

    constructor(inputChange?: {[key: number]: boolean}) {
        this.inputChange = inputChange;
    }

    public getEventId(): string {
        return Input.eventId;
    }
}