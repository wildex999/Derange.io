
import {IEvent} from "./IEvent";

export class Movement implements IEvent {
    public time: number; //Time this movement started(Since world start)

    //The starting location of the movement
    public startX: number;
    public startY: number;

    //The delta to apply each tick
    public deltaX: number;
    public deltaY: number;

    constructor(time: number, startX: number, startY: number, deltaX: number, deltaY: number) {
        if(time == null)
            time = 0;

        this.time = time;
        this.startX = startX;
        this.startY = startY;
        this.deltaX = deltaX;
        this.deltaY = deltaY;
    }
}