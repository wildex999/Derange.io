import {Game} from "./Game";
import {ClientSyncer} from "./ClientSyncer";
import {Tick} from "../common/models/tick";
import {MapDownload} from "../common/models/MapDownload";
import {Assets} from "./assets";
import {Camera} from "./Camera";

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

        //Setup handlers and syncing
        let syncer = new ClientSyncer(this.game.client.socket, this.game);
        syncer.defineClientObjects();

        //Listen for map download
        this.game.client.socket.on(MapDownload.eventId, (data) => this.onMapDownload(data));

        //Tell the server that we are joining the world, and wait for sync updates.
        this.game.client.joinWorld();
    }

    update() {
        if(this.game.startTime == -1)
            return;

        let prevTime = this.game.clientTime;
        this.game.clientTime = Date.now() - this.game.startTime;
        //console.log("TickTime: " + (this.game.clientTime - prevTime));

        //Inform server we are what time we are up to
        this.game.sendTick();
    }

    onMapDownload(mapData: MapDownload) {
        this.game.cache.addTilemap("tilemap", null, mapData.mapJson, Phaser.Tilemap.TILED_JSON);
        this.map = this.game.add.tilemap("tilemap");

        this.map.addTilesetImage("Test", Assets.tileSet.key);

        //Setup layers
        let mainLayer = this.map.createLayer("MainLayer");
        let overLayer = this.map.createLayer("OverLayer");
        let collisionLayer = this.map.createLayer("CollisionLayer");
        collisionLayer.visible = false;

        //Setup collisions
        this.map.setCollisionBetween(0, 200, true, collisionLayer);
        this.game.physics.p2.convertTilemap(this.map, collisionLayer);
        this.game.physics.p2.convertCollisionObjects(this.map, "CollisionObjects");

        mainLayer.resizeWorld();
        this.game.myCam.add(this.game.layerBack);
        this.game.myCam.add(this.game.layerMid);
        this.game.myCam.add(this.game.layerFront);

        this.game.layerBack.add(mainLayer);
        this.game.layerFront.add(overLayer);
    }
}