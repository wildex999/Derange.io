
import {StateConnect} from "./stateconnect";
import {StateGame} from "./stategame";
import {Client} from "./client";
import {StateLoad} from "./stateload";
import {Move} from "../common/models/gameobject/move";

export class Game extends Phaser.Game {
    public client: Client;

    public tick: number;
    public serverTick: number;

    constructor() {
        super(640, 400, Phaser.AUTO, "content");

        this.state.add(StateLoad.stateKey, StateLoad);
        this.state.add(StateConnect.stateKey, StateConnect);
        this.state.add(StateGame.stateKey, StateGame);

        this.tick = 0;
        this.serverTick = 0;

        this.state.start(StateLoad.stateKey, true, false, this);
    }

    /**
     * Send movement to server
     * @param x
     * @param y
     */
    public doMove(move: Move) {
        this.client.socket.emit(move.getEventId(), move);
    }
}