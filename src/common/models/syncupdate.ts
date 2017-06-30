
export class SyncUpdate implements Model {
    public static eventId = "sync";

    public instanceId: string;
    public syncData: string;

    constructor(instanceId: string, syncData: string) {
        this.instanceId = instanceId;
        this.syncData = syncData;
    }

    public getEventId(): string {
        return SyncUpdate.eventId;
    }
}