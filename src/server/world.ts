import * as p2 from 'p2';
import PhysicsWorld = p2.World;

import {ServerSyncer} from "./ServerSyncer";
import {Client} from "./client";
import {PlayerServer} from "./playerserver";
import {GameObject} from "./GameObject";
import {Tick} from "../common/models/tick";

export class World extends PhysicsWorld {
    syncer: ServerSyncer;
    newClients: {[key: string]: Client}; //New clients which require full sync. Key: ClientId

    entities: {[key: number]: GameObject}; //All object instances in the world
    instanceCount: number = 0;
    currentTick: number = 0;

    constructor(syncer: ServerSyncer) {
        super();

        this.syncer = syncer;
        this.newClients = {};

        this.entities = {};
    }

    public tick() {
        //Add new clients to syncer and send initial sync
        for(let clientId in this.newClients) {
            let client: Client = this.newClients[clientId];
            this.syncer.addClient(client);
        }
        this.newClients = {};

        //Update tick
        this.currentTick++;
        this.syncer.sendTick(this.currentTick);

        //Update World
        for(let instanceId in this.entities) {
            let objInst = this.entities[instanceId];
            objInst.onUpdate();
        }

        //Send delta sync to existing clients
        this.syncer.sendDeltaSync();
    }

    public addEntity(objInst: GameObject) {
        if((<any>objInst).syncObjectId)
            this.syncer.addInstance(objInst);

        objInst.instanceId = this.instanceCount++;
        this.entities[objInst.instanceId] = objInst;
        objInst.onCreated();
    }

    public removeEntity(instanceId: number) {
        let objInst: GameObject = this.entities[instanceId];
        if(objInst == null)
            throw new Error("Trying to remove object from World, which does not exist: " + instanceId);

        objInst.onDestroy();
        if((<any>objInst).syncObjectId)
            this.syncer.removeInstance(objInst);

        delete this.entities[instanceId];
    }

    /**
     * Client joining the world
     * @param client
     */
    public joinWorld(client: Client) {
        this.newClients[client.clientId] = client;

        //Add player for the client
        let player = new PlayerServer(client.clientId);
        client.playerInstance = player;
        this.addEntity(player);

    }

    public leaveWorld(client: Client) {
        delete this.newClients[client.clientId];
        this.syncer.removeClient(client);

        if(client.playerInstance)
            this.removeEntity(client.playerInstance.instanceId);
    }
}