
export class Tick implements Model {
    public static eventId: string = "Tick";

    time: number;

    constructor(time?: number) {
        this.time = time || -1;
    }

    public getEventId(): string {
        return Tick.eventId;
    }
}