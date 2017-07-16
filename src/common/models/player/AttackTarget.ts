
export class AttackTarget implements Model {
    public static eventId = "attacktarget";

    public instanceId: number; //InstanceId of target object
    public type: number; //Attack type(Primary, secondary etc.)

    constructor(instanceId: number, type: number) {
        this.instanceId = instanceId;
        this.type = type;
    }

    public getEventId(): string {
        return AttackTarget.eventId;
    }
}