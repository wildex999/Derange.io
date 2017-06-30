
export class Tick implements Model {
    public static eventId: string = "Tick";

    tick: number;

    constructor(tick?: number) {
        this.tick = tick | -1;
    }

    public getEventId(): string {
        return Tick.eventId;
    }
}