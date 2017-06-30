
export class Protocol implements Model {
    public static eventId: string = "protocolVersion";

    public protocolVersion: number;

    constructor(protocolVersion?: number) {
        if(protocolVersion)
            this.protocolVersion = protocolVersion;
    }

    getEventId(): string {
        return Protocol.eventId;
    }
}