import {Login} from "../common/models/Login";
import {LoginResponse, LoginResponseCode} from "../common/models/LoginResponse";
import {GameObject} from "./GameObject";
import {Move} from "../common/models/gameobject/move";
import {PlayerServer} from "./playerserver";

export class Client {
    private static clientIdCounter: number = 0;

    socket: SocketIO.Socket;
    clientId: string;

    username: string;

    public playerInstance: PlayerServer;

    constructor(socket: SocketIO.Socket, clientId?: string) {
        this.socket = socket;

        if(!clientId)
            this.clientId = String(Client.clientIdCounter++);
        else
            this.clientId = clientId;

        //Setup listeners
        socket.on(Login.eventId, (login) => this.onLogin(login));
        socket.on(Move.eventId, (move) => this.onMove(move));
    }

    onLogin(login: Login) {
        //TODO: Check the login information

        this.username = login.username;

        //Send back response
        let response: LoginResponse = new LoginResponse(LoginResponseCode.Ok, null, this.clientId);
        response.code = LoginResponseCode.Ok;

        this.socket.emit(response.getEventId(), response);
    }

    onMove(move: Move) {
        let position = this.playerInstance.position;
        position.x = move.x;
        position.y = move.y;
    }

}