import {Game} from "./Game";
import {ClientSyncer} from "./ClientSyncer";
import {MapDownload} from "../common/models/MapDownload";
import {Assets} from "./assets";
import {Camera} from "./Camera";
import {Map} from "../common/map/map";

import * as p2js from "p2"
import World = p2js.World;
import {IGameObject} from "./IGameObject";

export class StateGame extends Phaser.State {
    public static stateKey: string = "Game";
    game: Game;
    map: Phaser.Tilemap;

    create() {
        this.game = <Game>this.game;

        this.game.world.setBounds(0, 0, 3000, 3000);
        //this.game.world.scale.setTo(3, 3);
        //this.game.camera.bounds.resize(100, 100);
        this.game.myCam = new Camera(this.game);
        this.game.myCam.scale.setTo(3,3);
        //this.game.myCam.zoomTo(3);
        this.game.add.existing(this.game.myCam);

        //Physics
        this.game.physicsWorld = new World();
        this.game.physicsWorld.gravity[0] = 0;
        this.game.physicsWorld.gravity[1] = 0;

        this.game.physicsWorld.on("beginContact", function (event){
            if(event.bodyA.parent && event.bodyA.parent.onBeginContact)
                event.bodyA.parent.onBeginContact(event.bodyB, event.shapeA, event.shapeB);
            if(event.bodyB.parent && event.bodyB.parent.onBeginContact)
                event.bodyB.parent.onBeginContact(event.bodyA, event.shapeB, event.shapeA);
        }, this);



        //Setup handlers and syncing
        let syncer = new ClientSyncer(this.game.client.socket, this.game);
        syncer.defineClientObjects();

        //Listen for map download
        this.game.client.socket.on(MapDownload.eventId, (data) => this.onMapDownload(data));

        //Tell the server that we are joining the world, and wait for sync updates.
        this.game.client.joinWorld();
    }

    update() {
        if(this.game.clientTick == -1)
            return;
        this.game.clientTick++;

        //Rewind and replay if needed
        if(this.game.rewindToTick > -1) {
            console.log("REWIND: " + (this.game.clientTick - this.game.rewindToTick));
            let clientTick = this.game.clientTick;
            this.game.clientTick = this.game.rewindToTick;
            this.game.isReplaying = true;

            //Tell all entities we are rewinding
            let objects = this.game.getObjects();
            for(let instanceId in objects) {
                let obj:any = objects[instanceId];
                if(obj.rewind)
                    obj.rewind(this.game.clientTick);
            }

            //Replay up to the current tick
            for(let currentTick = this.game.clientTick; currentTick < clientTick; currentTick++) {
                this.game.clientTick = currentTick;

                this.game.physicsWorld.step(1/this.game.tickRate);
                for(let instanceId in objects) {
                    let obj: IGameObject = objects[instanceId];
                    obj.update();
                }
            }


            this.game.rewindToTick = -1;
            this.game.clientTick = clientTick;
            this.game.isReplaying = false;
        }

        //Step Physics World
        this.game.physicsWorld.step(1/this.game.tickRate);
    }

    onMapDownload(mapData: MapDownload) {
        this.game.cache.addTilemap("tilemap", null, mapData.mapJson, Phaser.Tilemap.TILED_JSON);
        this.map = this.game.add.tilemap("tilemap");

        this.map.addTilesetImage("Test", Assets.tileSet.key);

        //Setup layers
        let mainLayer = this.map.createLayer("MainLayer");
        let overLayer = this.map.createLayer("OverLayer");
        //let collisionLayer = this.map.createLayer("CollisionLayer");
        //collisionLayer.visible = false;

        //Setup collisions
        let testMap = new Map();
        testMap.fromJson(mapData.mapJson);
        let bodies = testMap.createCollidersFromLayer("CollisionLayer");
        for(let body of bodies) {
            this.game.physicsWorld.addBody(body);

            /*let d = this.game.add.graphics(body.position[0] - 8, body.position[1] - 8);
            d.beginFill(0xFF0000, 1);
            d.drawRect(0, 0, (<any>body.shapes[0]).width, (<any>body.shapes[0]).height);
            this.game.layerFront.add(d);*/
        }
        //this.map.setCollisionBetween(0, 200, true, collisionLayer);
        //this.game.physics.p2.convertTilemap(this.map, collisionLayer);
        //this.game.physics.p2.convertCollisionObjects(this.map, "CollisionObjects");

        mainLayer.resizeWorld();
        this.game.myCam.add(this.game.layerBack);
        this.game.myCam.add(this.game.layerMid);
        this.game.myCam.add(this.game.layerFront);

        this.game.layerBack.add(mainLayer);
        this.game.layerFront.add(overLayer);
    }
}