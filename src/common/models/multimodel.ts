/**
 * Multiple events combined into one.
 */
export class MultiEvent implements Model {
    public static eventId: string = "multi";

    public events: Model[];

    constructor(events: Model[]) {
        this.events = events;
    }

    getEventId(): string {
        return MultiEvent.eventId;
    }
}