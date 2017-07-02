
import {Client} from "./client";
import {SyncCreate} from "../common/models/synccreate";
import {ISyncedObject} from "../common/sync/ISyncedObject";
import {SyncUpdate} from "../common/models/syncupdate";
import {SyncDestroy} from "../common/models/syncdestroy";
import {Tick} from "../common/models/tick";

export class ServerSyncer {
    public static idCounter = 1;

    objectInstances: {[key: string]: ISyncedObject}; //Key: InstanceId
    clients: {[key: string]: Client}; //Key: ClientId

    changedObjects: {[key: string]: SyncEvent}; //Key: instanceId

    constructor() {
        this.clients = {};
        this.objectInstances = {};
        this.changedObjects = {};
    }

    public addClient(client: Client) {
        if(this.clients[client.clientId])
            throw new Error("Trying to add client to sync which already exists: " + client.clientId);

        this.clients[client.clientId] = client;
        this.sendFullSync(client);
    }

    public removeClient(client: Client) {
        if(!this.clients[client.clientId])
            return;

        delete this.clients[client.clientId];
    }

    public addInstance(objInst: any): void {
        let objectInstance: ISyncedObject = objInst;

        let objectId: string = objectInstance.syncObjectId;
        if(!objectId)
            throw new Error("Trying to add sync object with no ObjectId: " + objectInstance);
        let instanceId: string = objectInstance.syncInstanceId;
        if(instanceId == null) {
            instanceId = String(ServerSyncer.idCounter++);
            objectInstance.syncInstanceId = instanceId;
        }
        if(this.objectInstances[instanceId])
            throw new Error("Trying to add object instance which is already added: " + objectId + " => " + instanceId);

        objectInstance.syncHandler = (objectInstance) => this.onHasChange(objectInstance);
        this.objectInstances[instanceId] = objectInstance;
        console.log("AddInstance: " + objectId + " => " + instanceId);

        //Add to next sync
        this.changedObjects[instanceId] = new SyncEvent(SyncType.Create, objectInstance);
    }

    public removeInstance(objInst: any): void {
        let objectInstance: ISyncedObject = objInst;
        let instanceId = objectInstance.syncInstanceId;
        if(!this.objectInstances[instanceId])
            throw new Error("Trying to remove object instance which does not exist: " + instanceId);

        //Add to next sync
        this.changedObjects[instanceId] = new SyncEvent(SyncType.Destroy, objectInstance);

        console.log("RemoveInstance: " + objectInstance.syncObjectId + " => " + instanceId);
    }

    /**
     * Send Create, Update and Destroy events
     */
    public doSync() {
        for(let instId in this.changedObjects) {
            let syncEvent: SyncEvent = this.changedObjects[instId];
            let obj: ISyncedObject = syncEvent.instance;
            let msg: Model;

            switch(syncEvent.syncType) {
                case SyncType.Create:
                    msg = new SyncCreate(obj.syncObjectId, obj.syncInstanceId, obj.syncEncode(false));
                    break;
                case SyncType.Update:
                    msg = new SyncUpdate(obj.syncInstanceId, obj.syncEncode(true));
                    break;
                case SyncType.Destroy:
                    msg = new SyncDestroy(obj.syncInstanceId, obj.syncEncode(true));
                    delete this.objectInstances[obj.syncInstanceId];
                    break;
            }

            console.log("Send " + syncEvent.syncType + ": " + JSON.stringify(msg));
            this.sendToAll(msg);
        }

        //Clear list of changed objects
        this.changedObjects = {};
    }

    /**
     * Send the latest tick number to clients
     */
    public sendTick(time: number) {
        let msg = new Tick(time);
        this.sendToAll(msg);
    }

    sendToAll(msg: Model) {
        for(let clientId in this.clients) {
            let client: Client = this.clients[clientId];
            client.socket.emit(msg.getEventId(), msg);
        }
    }

    /**
     * Called by @SyncedObject when it has a change which needs to be synced
     * @param objInst
     */
    onHasChange(objInst: ISyncedObject) {
        if(this.changedObjects[objInst.syncInstanceId])
            return;
        //TODO: pool SyncEvent objects? A lot of GC here.
        this.changedObjects[objInst.syncInstanceId] = new SyncEvent(SyncType.Update, objInst);
    }

    /**
     * Send a full sync of all objects to the given Client.
     * Should always be called AFTER normal update, as this clears changed lists in objects.
     * @param client
     */
    sendFullSync(client: Client) {
        console.log("New client: " + client.clientId + ", syncing " + Object.keys(this.objectInstances).length + " objects.");
        if(Object.keys(this.changedObjects).length != 0)
            throw new Error("Sending full sync with pending sync changes: " + JSON.stringify(this.changedObjects));

        for(let instId in this.objectInstances) {
            let obj: ISyncedObject = this.objectInstances[instId];
            let msgCreate = new SyncCreate(obj.syncObjectId, instId, obj.syncEncode(false));

            client.socket.emit(msgCreate.getEventId(), msgCreate);
        }
    }
}

enum SyncType {
    Create,
    Update,
    Destroy
}

class SyncEvent {
    public syncType: SyncType;
    public instance: ISyncedObject;

    constructor(syncType: SyncType, instance: ISyncedObject) {
        this.syncType = syncType;
        this.instance = instance;
    }
}