import {Login} from "../common/models/Login";
import {LoginResponse, LoginResponseCode} from "../common/models/LoginResponse";
import {Move} from "../common/models/gameobject/move";
import {PlayerServer} from "./playerserver";
import {World} from "./world";
import {Input} from "../common/models/Input";
import {Tick} from "../common/models/tick";
import {IAction} from "../common/actions/IAction";
import {Action} from "../common/models/Action";
import {AttackTarget} from "../common/models/player/AttackTarget";

export class Client {
    private static clientIdCounter: number = 0;

    socket: SocketIO.Socket;
    clientId: string;

    username: string;
    actionBuffer: {[key: number]: IAction[]}; //Buffer of Actions for a given client tick. Key is client tick.

    public playerInstance: PlayerServer;
    public world: World;
    public clientTick: number; //Last handled tick from client
    public clientTickReceived: number; //Last client tick received(But not necessarily handled)
    public serverTick: number; //Last seen server tick by client

    constructor(socket: SocketIO.Socket, world: World, clientId?: string) {
        this.socket = socket;
        this.world = world;
        this.clientTick = -1;
        this.clientTickReceived = -1;
        this.serverTick = -1;

        if(!clientId)
            this.clientId = String(Client.clientIdCounter++);
        else
            this.clientId = clientId;

        this.actionBuffer = {};

        //Setup listeners
        socket.on(Login.eventId, (login) => this.onLogin(login));
        socket.on(Move.eventId, (move) => this.onMove(move));
        //socket.on(Input.eventId, (input) => this.onInput(input));
        socket.on(Action.eventId, (action) => this.onAction(action));
        socket.on(Tick.eventId, (tick) => this.onTick(tick));
        socket.on(AttackTarget.eventId, (data) => this.onAttackTarget(data));
    }

    /**
     * Apply actions from client and increment tick
     */
    public applyActions() {
        if(this.clientTick == -1 || this.clientTick == this.clientTickReceived)
            return;

        this.clientTick++;

        //Catch up by one tick if we are behind and there is no action
        if(this.actionBuffer[this.clientTick] == null && this.clientTick < this.clientTickReceived)
            this.clientTick++;

        //console.log("BEHIND: " + (this.clientTickReceived - this.clientTick));
        //console.log("Apply actions: " + this.clientTick + " | " + JSON.stringify(this.actionBuffer));

        //Apply buffered actions
        let buffer = this.actionBuffer[this.clientTick];
        if(buffer != null && this.playerInstance != null) {
            for(let action of buffer)
                this.playerInstance.onAction(action);
        }

        delete this.actionBuffer[this.clientTick];
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
        //let position = this.playerInstance.position;
        //position.doMove(move, this.world.tickTime);
    }

    /*onInput(input: Input) {
        if(this.playerInstance == null)
            return;

        this.playerInstance.updateInput(input);
    }*/

    onAction(action: Action) {
        if(this.clientTickReceived == -1)
            return;

        let bufferTick = this.clientTickReceived + 1; //We buffer the next tick, as client tick is sent last.
        let buffer: IAction[] = this.actionBuffer[bufferTick];
        if(buffer == null) {
            buffer = [];
            this.actionBuffer[bufferTick] = buffer;
        }

        buffer.push(action.action);
    }

    onTick(tick: Tick) {
        //console.log("ClientTick: " + tick.tick);
        if(this.clientTick == -1)
            this.clientTick = tick.tick;

        this.clientTickReceived = tick.tick;
        this.serverTick = tick.remoteTick;

        //If the client tick gets too far ahead of the handled tick, we drop the unhandled actions
        if(this.clientTickReceived - this.clientTick > 10*this.world.tickRate) {
            this.clientTick = this.clientTickReceived;
            this.actionBuffer = {};
            return;
        }
    }

    onAttackTarget(attackTarget: AttackTarget) {
        if(this.playerInstance == null)
            return;

        this.playerInstance.onAttackTarget(attackTarget.instanceId, attackTarget.type);
    }

}