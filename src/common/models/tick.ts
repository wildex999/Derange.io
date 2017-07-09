
export class Tick implements Model {
    public static eventId: string = "Tick";

    tick: number;
    remoteTick: number; //Last processed tick from other end

    constructor(tick: number, remoteTick: number) {
        this.tick = tick;
        this.remoteTick = remoteTick;
    }

    public getEventId(): string {
        return Tick.eventId;
    }
}