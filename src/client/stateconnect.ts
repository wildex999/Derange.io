
import {Protocol} from "../common/models/protocol";
import {Version} from "../common/version";
import {Client} from "./client";
import {Game} from "./Game";
import {LoginResponse} from "../common/models/LoginResponse";
import {StateGame} from "./stategame";
import * as QueryString from "query-string";

/**
    * Connecting to the server, logging in and joining a world.
    */
export class StateConnect extends Phaser.State {
    public static stateKey: string = "Connect";

    client: Client;

    create() {
        let parsed = QueryString.parse(location.search);
        let server = parsed["server"];
        if(!server)
            server = window.location.hostname || "localhost";
        let socket: SocketIOClient.Socket = io('http://' + server + ':8765');

        //Send our protocol version for verification. If this does not match with the server, we will be disconnected.
        let protocol: Protocol = new Protocol(Version.protocolVersion);
        socket.emit(protocol.getEventId(), protocol);

        this.client = new Client(socket, "TestUser");
        this.client.login((response) => this.onLogin(response));
    }

    update() {

    }

    onLogin(response: LoginResponse) {
        let game = <Game>this.game
        game.client = this.client;

        //Move on to the game state
        this.state.start(StateGame.stateKey, true);
    }

}