
import {StateConnect} from "./stateconnect";
import {StateGame} from "./stategame";
import {Client} from "./client";
import {StateLoad} from "./stateload";
import {Move} from "../common/models/gameobject/move";
import {Tick} from "../common/models/tick";
import {Camera} from "./Camera";
import {InputManager} from "./InputManager";
import Group = Phaser.Group;

export class Game extends Phaser.Game {
    public client: Client;
    public myCam: Camera;
    public inputManager: InputManager;

    public startTime: number;
    public clientTime: number;
    public serverTime: number;

    public layerFront: Group;
    public layerMid: Group;
    public layerBack: Group;


    constructor() {
        super(640, 400, Phaser.AUTO, "content");

        this.state.add(StateLoad.stateKey, StateLoad);
        this.state.add(StateConnect.stateKey, StateConnect);
        this.state.add(StateGame.stateKey, StateGame);

        this.startTime = -1;
        this.clientTime = -1;
        this.serverTime = -1;

        this.state.start(StateLoad.stateKey, true, false, this);
    }

    public sendTick() {
        let msg = new Tick(this.clientTime);
        this.client.socket.emit(msg.getEventId(), msg);
    }

    /**
     * Send movement to server
     */
    public doMove(move: Move) {
        this.client.socket.emit(move.getEventId(), move);
        //console.log("Client Move: " + JSON.stringify(move));
    }
}