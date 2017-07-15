import {Login} from "../common/models/Login";
import {LoginResponse, LoginResponseCode} from "../common/models/LoginResponse";
import {JoinWorld} from "../common/models/joinworld";

export class Client {
    _socket: SocketIOClient.Socket;
    _username: string;
    _loggedIn: boolean;
    clientId: string;

    _loginCallback: (response: LoginResponse) => void;

    constructor(socket: SocketIOClient.Socket, username: string, disconnectHandler: () => void) {
        this._socket = socket;
        this._username = username;

        this._loggedIn = false;

        //Setup handlers
        this._socket.on(LoginResponse.eventId, (data) => this.onLogin(data));
        this._socket.on("disconnect", (event) => disconnectHandler());
    }

    get username(): string {
        return this._username;
    }

    get socket(): SocketIOClient.Socket {
        return this._socket;
    }

    /**
     * Login the client.
     * Note: If already logged in, this will do nothing.
     * @param callback The callback to call with the login results. Note, this will overwrite any existing callback.
     */
    public login(callback: (response: LoginResponse) => void) {
        if(this._loggedIn)
            return;

        this._loginCallback = callback;

        //Send login request
        let login = new Login(this._username);
        this.socket.emit(login.getEventId(), login);

    }

    public joinWorld() {
        console.log("Join world");
        let joinWorld = new JoinWorld();
        this.socket.emit(joinWorld.getEventId(), joinWorld);
    }

    onLogin(response: LoginResponse) {
        this._loggedIn = response.code == LoginResponseCode.Ok;
        this.clientId = response.clientId;
        if(this._loginCallback != null)
            this._loginCallback(response);
    }

}