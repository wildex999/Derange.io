import * as http from 'http';
import * as io from 'socket.io';

import { Client } from "./client"
import {Protocol} from "../common/models/protocol";
import {JoinWorld} from "../common/models/joinworld";
import {ServerSyncer} from "./ServerSyncer";
import {World} from "./world";

export class Server {
    public static protocolVersion: number = 1;

    public clients: {[key: string]: Client}; //Key: SocketId

    serverSync: ServerSyncer;
    world: World;

    syncRate: number = 20;
    tickRate: number = 60.0;
    currentTick: number = 0;
    loopStart: number;
    tickTime: number;

    constructor() {
        this.clients = {};

        //Start World
        this.serverSync = new ServerSyncer();
        this.world = new World(this.serverSync, this.tickRate, this.syncRate);

        //Load the map
        this.world.loadMap("assets/maps/test.json");

        //Start the server
        let httpServer = http.createServer();
        httpServer.listen(8765);
        let ioServer = io(httpServer);

        ioServer.on('connection', (socket) => this.onConnection(socket));

        console.log("Started server");

        //Run game loop
        this.loopStart = Date.now();
        this.tickTime = 1000.0/this.tickRate;
        setTimeout(() => this.gameLoop(), this.tickTime);
    }

    gameLoop() {
        //console.log("Loop: " + (new Date().getTime() - this.lastLoop));
        this.world.tick(this.tickTime, this.currentTick);

        this.currentTick++;
        let nextTick = this.loopStart + (this.currentTick * this.tickTime);
        let nextDelta = nextTick - Date.now();
        if(nextDelta < 0)
            setImmediate(() => this.gameLoop());
        else
            setTimeout(() => this.gameLoop(), nextDelta);
    }

    onConnection(socket: SocketIO.Socket) {
        console.log("Client connect: " + socket);

        //Create client
        let client = new Client(socket, this.world);
        this.clients[socket.id] = client;

        //Setup handlers
        socket.on('disconnect', (socket) => this.onDisconnect(client, socket));
        socket.on(JoinWorld.eventId, (data) => this.onJoinWorld(client, data));

        //Send the protocol version
        socket.emit(Protocol.eventId, Server.protocolVersion);
    }

    onDisconnect(client: Client, socket: SocketIO.Socket) {
        //TODO: Allow the client to cleanup.
        console.log("Client disconnect: " + client);
        this.world.leaveWorld(client);
        delete this.clients[socket.id];
    }

    onJoinWorld(client: Client, msg: JoinWorld) {
        this.world.joinWorld(client);
    }

}