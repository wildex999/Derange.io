import * as p2 from 'p2';
import PhysicsWorld = p2.World;

import {ServerSyncer} from "./ServerSyncer";
import {Client} from "./client";
import {PlayerServer} from "./playerserver";
import {GameObject} from "./GameObject";
import {Map} from "../common/map/map";
import {TileObject} from "../common/map/TileObject";
import * as fs from "fs";
import {MapDownload} from "../common/models/MapDownload";
import {EnemyDummy} from "./entities/EnemyDummy";

export class World extends PhysicsWorld {
    syncer: ServerSyncer;
    newClients: {[key: string]: Client}; //New clients which require full sync. Key: ClientId

    entities: {[key: number]: GameObject}; //All object instances in the world
    instanceCount: number = 0;

    worldStart: number;
    tickTime: number; //Milliseconds since world start in this tick

    tickRate: number;
    syncRate: number;
    syncCount: number;

    map: Map;
    spawn: TileObject;

    constructor(syncer: ServerSyncer, tickRate: number, syncRate: number) {
        super();

        this.worldStart = new Date().getTime();

        this.syncer = syncer;
        this.tickRate = tickRate;
        this.syncRate = syncRate;

        this.newClients = {};
        this.entities = {};
        this.syncCount = this.tickRate/this.syncRate;

        let enemy = new EnemyDummy(this);
        enemy.setPosition(100, 100);
        this.addEntity(enemy);
    }

    public loadMap(mapFile: string) {
        let file = fs.readFileSync(mapFile, 'utf8');
        this.map = new Map();
        this.map.fromJson(JSON.parse(file));

        this.spawn = this.map.findSpawn();

        console.log("Got Spawn: " + this.spawn.x + " | " + this.spawn.y);
    }

    public tick() {
        let lastTick = this.tickTime;
        this.tickTime = new Date().getTime() - this.worldStart;
        //console.log("Tick: " + (this.tickTime - lastTick));

        //Add new clients to syncer and send initial sync
        for(let clientId in this.newClients) {
            let client: Client = this.newClients[clientId];
            this.syncer.addClient(client);
        }
        //Add players for clients(Done after initial sync, to avoid pending sync changes)
        for(let clientId in this.newClients) {
            let client: Client = this.newClients[clientId];

            //Add player for the client
            let player = new PlayerServer(client.clientId, this);
            client.playerInstance = player;
            this.addEntity(player);

            //Move player to spawn
            player.setPosition(this.spawn.x, this.spawn.y);
        }
        this.newClients = {};

        //Update time for clients
        this.syncer.sendTick(this.tickTime);

        //Update World
        for(let instanceId in this.entities) {
            let objInst = this.entities[instanceId];
            objInst.onUpdate(this.tickTime);
        }

        //Send delta sync to existing clients
        if(this.syncCount-- <= 0) {
            this.syncer.doSync();
            this.syncCount = this.tickRate/this.syncRate;
        }
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

        //Send the world
        let mapDownload = new MapDownload(this.map);
        client.socket.emit(mapDownload.getEventId(), mapDownload);
    }

    public leaveWorld(client: Client) {
        delete this.newClients[client.clientId];
        this.syncer.removeClient(client);

        if(client.playerInstance)
            this.removeEntity(client.playerInstance.instanceId);
    }
}