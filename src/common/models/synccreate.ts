/**
 * Message to add a new synced object.
 */
export class SyncCreate implements Model {
    public static eventId = "SyncCreate";

    public objectId: string;
    public instanceId: string;
    public syncData: string; //The initial full state sync

    constructor(objectId: string, instanceId: string, syncData: string) {
        this.objectId = objectId;
        this.instanceId = instanceId;
        this.syncData = syncData;
    }

    public getEventId(): string {
        return SyncCreate.eventId;
    }
}