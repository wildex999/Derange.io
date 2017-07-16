import {ServerSyncer} from "./ServerSyncer";
import {Client} from "./client";
import {PlayerServer} from "./playerserver";
import {Map} from "../common/map/map";
import {TileObject} from "../common/map/TileObject";
import * as fs from "fs";
import {MapDownload} from "../common/models/MapDownload";

import * as p2js from 'p2'
import PhysicsWorld = p2js.World;
import {EnemyDummy} from "./entities/EnemyDummy";
import {WalkingEnemyDummy} from "./entities/WalkingEnemyDummy";
import {EnemyDummyFollowPlayer} from "./entities/EnemyDummyFollowPlayer";
import {IGameObject} from "./IGameObject";

export class World {
    syncer: ServerSyncer;
    newClients: {[key: string]: Client}; //New clients which require full sync. Key: ClientId

    physicsWorld: PhysicsWorld;
    entities: {[key: number]: IGameObject}; //All object instances in the world
    players: {[key: number]: IGameObject};
    instanceCount: number = 0;

    tickDelta: number;
    currentTick: number;

    tickStart: number;

    tickRate: number;
    syncRate: number;
    syncCount: number;

    map: Map;
    spawn: TileObject;

    constructor(syncer: ServerSyncer, tickRate: number, syncRate: number) {
        this.physicsWorld = new PhysicsWorld();
        this.physicsWorld.gravity[0] = 0;
        this.physicsWorld.gravity[1] = 0;
        this.physicsWorld.applyGravity = false;

        this.physicsWorld.on("beginContact", function (event){
            if(event.bodyA.parent && event.bodyA.parent.onBeginContact)
                event.bodyA.parent.onBeginContact(event.bodyB, event.shapeA, event.shapeB);
            if(event.bodyB.parent && event.bodyB.parent.onBeginContact)
                event.bodyB.parent.onBeginContact(event.bodyA, event.shapeB, event.shapeA);
        }, this);

        this.syncer = syncer;
        this.tickRate = tickRate;
        this.syncRate = syncRate;

        this.newClients = {};
        this.entities = {};
        this.players = {};
        this.syncCount = this.tickRate/this.syncRate;
    }

    public loadMap(mapFile: string) {
        let file = fs.readFileSync(mapFile, 'utf8');
        this.map = new Map();
        this.map.fromJson(JSON.parse(file));

        this.spawn = this.map.findSpawn();

        //Setup colliders
        let colliders = this.map.createCollidersFromLayer("CollisionLayer");
        console.log("Adding " + colliders.length + " colliders.");
        for(let collider of colliders) {
            this.physicsWorld.addBody(collider);
        }

        console.log("Got Spawn: " + this.spawn.x + " | " + this.spawn.y);

        this.spawnEnemiesFromMap();
        console.log("Spawned enemies");
    }

    public tick(tickDelta: number, currentTick: number) {
        this.tickStart = Date.now();
        this.tickDelta = tickDelta;
        this.currentTick = currentTick;

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
            this.players[player.instanceId] = player;

            //Move player to spawn
            player.setPosition(this.spawn.x, this.spawn.y);
        }
        this.newClients = {};

        //Apply actions from clients
        for(let clientId in this.syncer.clients) {
            let client: Client = this.syncer.clients[clientId];
            client.applyActions();
        }

        //Update Physics
        //console.log("Bodies: " + this.physicsWorld.bodies.length);
        this.physicsWorld.step(1/this.tickRate);

        //Update Entities
        for(let instanceId in this.entities) {
            let objInst = this.entities[instanceId];
            objInst.onUpdate();
        }

        //Send delta sync to existing clients
        this.syncer.sendTick(this.currentTick);
        if(this.syncCount-- <= 0) {
            this.syncer.doSync();
            this.syncCount = this.tickRate/this.syncRate;
        }

        //console.log("TickTime: " + (Date.now() - this.tickStart));

    }

    public addEntity(objInst: IGameObject) {
        if((<any>objInst).syncObjectId)
            this.syncer.addInstance(objInst);

        objInst.instanceId = this.instanceCount++;
        this.entities[objInst.instanceId] = objInst;
        objInst.onCreated();
    }

    public removeEntity(instanceId: number) {
        let objInst: IGameObject = this.entities[instanceId];
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

        if(client.playerInstance) {
            delete this.players[client.playerInstance.instanceId];
            this.removeEntity(client.playerInstance.instanceId);
        }
    }

    spawnEnemiesFromMap() {
        let enemySpawns = this.map.getEnemySpawns();

        for(let spawn of enemySpawns) {
            let dummy: EnemyDummy;

            if(spawn.name == "DummyNormal")
                dummy = new EnemyDummy(this);
            else if(spawn.name == "DummyWalk")
                dummy = new WalkingEnemyDummy(this);
            else if(spawn.name = "DummyFollow")
                dummy = new EnemyDummyFollowPlayer(this);

            if(dummy != null) {
                dummy.setPosition(spawn.x, spawn.y);
                this.addEntity(dummy);
            }
        }
        /*this.spawnEnemyDummy(100, 100);
        this.spawnEnemyDummy(116, 100);
        this.spawnEnemyDummy(132, 100);

        this.spawnEnemyDummy(200, 140);
        this.spawnEnemyDummy(232, 140);
        this.spawnEnemyDummy(264, 90);

        let enemy = new WalkingEnemyDummy(this);
        enemy.setPosition(200, 180);
        this.addEntity(enemy);

        let enemyFollow = new EnemyDummyFollowPlayer(this);
        enemyFollow.setPosition(100, 80);
        this.addEntity(enemyFollow);*/

    }

    spawnEnemyDummy(x: number, y: number) {
        let enemy = new EnemyDummy(this);
        enemy.setPosition(x, y);
        this.addEntity(enemy);
    }

}