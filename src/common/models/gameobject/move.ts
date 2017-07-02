
export class Move implements Model {
    public static eventId: string = "move";

    public startX: number;
    public startY: number;
    public deltaX: number;
    public deltaY: number;

    constructor(x?: number, y?: number, dx?: number, dy?: number) {
        this.startX = x || 0;
        this.startY = y || 0;
        this.deltaX = dx || 0;
        this.deltaY = dy || 0;
    }

    public getEventId(): string {
        return Move.eventId;
    }
}