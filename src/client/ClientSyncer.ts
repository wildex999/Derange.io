/**
 * Setup the client side syncing
 */
import {SyncUpdate} from "../common/models/syncupdate";
import {SyncCreate} from "../common/models/synccreate";
import {SyncDestroy} from "../common/models/syncdestroy";
import {ISyncedObject} from "../common/sync/ISyncedObject";
import {PlayerClient} from "./playerclient";
import {Game} from "./Game";
import Sprite = Phaser.Sprite;
import {IGameObject} from "./IGameObject";
import {Tick} from "../common/models/tick";

export class ClientSyncer {
    socket: SocketIOClient.Socket;
    game: Game;

    definedObjects: {[key: string]: ISyncedObject}; //Key: ObjectId
    objectInstances: {[key: string]: ISyncedObject}; //Key: InstanceId

    constructor(socket: SocketIOClient.Socket, game: Game) {
        this.socket = socket;
        this.game = game;
        this.definedObjects = {};
        this.objectInstances = {};

        //Listen for sync
        this.socket.on(SyncCreate.eventId, (data) => this.onSyncCreate(data));
        this.socket.on(SyncDestroy.eventId, (data) => this.onSyncDestroy(data));
        this.socket.on(SyncUpdate.eventId, (data) => this.onSyncUpdate(data));

        //Listen for other
        this.socket.on(Tick.eventId, (data) => this.onServerTick(data));
    }

    public defineClientObjects() {
        this.defineObject(PlayerClient);
    }

    public defineObject(defineObject: any): void {
        let syncedObject: ISyncedObject = defineObject;
        let objectId: string = syncedObject.syncObjectId;
        if(!objectId)
            throw new TypeError("Trying to add class which is either not a @SyncedObject, or is missing an object id: " + defineObject);
        if(this.definedObjects[objectId] != null)
            throw new TypeError("There is already a class with the ObjectId " + objectId + " registered for syncing!");

        console.log("AddSync: " + objectId);
        this.definedObjects[objectId] = syncedObject;
    }

    public addInstance(newInstance: any): void {
        let objectInstance: ISyncedObject = newInstance;
        let objectId: string = objectInstance.syncObjectId;
        if(!this.definedObjects[objectId])
            throw new TypeError("Trying to add object instance which has not been defined in syncer: " + objectId);

        let instanceId: string = objectInstance.syncInstanceId;
        if(instanceId == null)
            throw new Error("Adding sync object with no instanceId: " + objectId);
        if(this.objectInstances[instanceId])
            throw new Error("Trying to add object instance which is already added: " + objectId + " => " + instanceId);

        this.objectInstances[instanceId] = objectInstance;
        console.log("AddInstance: " + objectId + " => " + instanceId);
    }

    public removeInstance(instanceId: string): void {
        let objectInstance: ISyncedObject = this.objectInstances[instanceId];
        if(objectInstance == null)
            throw new Error("Trying to remove object instance which does not exist: " + instanceId);

        console.log("RemoveInstance: " + objectInstance.syncObjectId + " => " + instanceId);
        delete this.objectInstances[instanceId];
    }

    onSyncCreate(sync: SyncCreate) {
        let objectClass = this.definedObjects[sync.objectId];
        if(!objectClass)
            throw new Error("Trying to SyncCreate an objectId which is not defined: " + sync.objectId);

        let objectInstance: ISyncedObject = new (<any>objectClass)();

        objectInstance.syncInstanceId = sync.instanceId;
        console.log("Create decode: " + sync.syncData);
        objectInstance.syncDecode(sync.syncData);

        console.log("Create new sync object: " + sync.objectId + " => " + sync.instanceId);
        this.addInstance(objectInstance);

        //If it's a game object, we let it initialize
        let gameObjectInstance: IGameObject = <any>objectInstance;
        if(gameObjectInstance.init)
            gameObjectInstance.init(this.game);

        objectInstance.syncCreated();

    }

    onSyncDestroy(sync: SyncDestroy) {
        let objectInstance: ISyncedObject = this.objectInstances[sync.instanceId];
        if(objectInstance == null)
            throw new Error("Unable to destroy synced object, none exist with instance id: " + sync.instanceId);

        objectInstance.syncDecode(sync.syncData);

        console.log("Remove sync object: " + objectInstance.syncObjectId + " => " + sync.instanceId);
        objectInstance.syncDestroy();

        this.removeInstance(sync.instanceId);
        (<Sprite><any>objectInstance).destroy();
    }

    onSyncUpdate(sync: SyncUpdate) {
        let objectInstance: ISyncedObject = this.objectInstances[sync.instanceId];
        if(objectInstance == null)
            throw new Error("Unable to sync object, none exist with the instance id: " + sync.instanceId);

        console.log("Sync object: " + objectInstance.syncObjectId + " => " + objectInstance.syncInstanceId);
        objectInstance.syncDecode(sync.syncData);

        //TODO: Update visibility in world?
        objectInstance.syncUpdated();
    }

    onServerTick(tick: Tick) {
        //TODO: Run multiple update to catch up to server? Allow client tick to deviate slightly?
        this.game.serverTime = tick.time;
        if(this.game.startTime == -1) {
            this.game.startTime = Date.now() - this.game.serverTime;
            this.game.clientTime = this.game.startTime;
            console.log("Joined server on time: " + this.game.serverTime);
        }
        //console.log(this.game.serverTime + " | " + this.game.clientTime + " | " + "Diff: " + (this.game.serverTime - this.game.clientTime));
    }
}