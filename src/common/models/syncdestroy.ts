/**
 * Message for Object being removed from Sync.
 * Either because it's outside the area of interest, or because it's destroyed.
 */
export class SyncDestroy {
    public static eventId = "SyncDestroy";

    public instanceId: string;
    public syncData: string; //Final state sync

    constructor(instanceId: string, syncData: string) {
        this.instanceId = instanceId;
        this.syncData = syncData;
    }

    public getEventId(): string {
        return SyncDestroy.eventId;
    }
}