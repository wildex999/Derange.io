
export class Move implements Model {
    public static eventId: string = "move";

    public x: number;
    public y: number;

    constructor(x?: number, y?: number) {
        this.x = x | 0;
        this.y = y | 0;
    }

    public getEventId(): string {
        return Move.eventId;
    }
}