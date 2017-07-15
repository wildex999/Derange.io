
import {StateConnect} from "./stateconnect";
import {StateGame} from "./stategame";
import {Client} from "./client";
import {StateLoad} from "./stateload";
import {Move} from "../common/models/gameobject/move";
import {Tick} from "../common/models/tick";
import {Camera} from "./Camera";
import {InputManager} from "./InputManager";
import Group = Phaser.Group;

import * as p2js from "p2"
import World = p2js.World;
import {IGameObject} from "./IGameObject";
import {IAction} from "../common/actions/IAction";
import {Action} from "../common/models/Action";
import {Keys} from "../common/Keys";

export class Game extends Phaser.Game {
    public client: Client;
    public myCam: Camera;
    public inputManager: InputManager;

    public clientTick: number;
    public clientRemoteTick: number; //Last tick seen by server
    public serverTick: number;
    public tickRate: number = 60; //TODO: Get from server
    public syncRate: number = 20; //TODO: Get from server

    public rewindToTick: number; //Set to a tick to rewind.
    public isReplaying: boolean; //Whether or not we are currently replaying old client states

    //Interpolate
    public syncTicks = this.tickRate / this.syncRate; //How many ticks between sync. TODO: calculate dynamic?
    public syncDelay = 2; //How many network syncs behind we want to interpolate TODO: Calculate depending on RTT?
    public debugServerPosition: boolean = false;

    public layerFront: Group;
    public layerMid: Group;
    public layerBack: Group;

    public physicsWorld: World;

    instanceCount: number; //Used to generate unique instance id
    objects: {[key: number]: IGameObject};

    constructor() {
        super(1024, 720, Phaser.AUTO, "content");

        this.state.add(StateLoad.stateKey, StateLoad);
        this.state.add(StateConnect.stateKey, StateConnect);
        this.state.add(StateGame.stateKey, StateGame);

        this.clientTick = -1;
        this.clientRemoteTick = -1;
        this.serverTick = -1;

        this.rewindToTick = -1;
        this.isReplaying = false;

        this.instanceCount = 1;
        this.objects = {};

        this.state.start(StateLoad.stateKey, true, false, this);
    }

    update(time: number) {
        super.update(time);

        if(this.inputManager.justDown(Keys.DebugPosition))
            this.debugServerPosition = !this.debugServerPosition;

        //Tell server we are on a new tick(And to apply every action it has received)
        if(this.clientTick > -1)
            this.sendTick();
    }

    public addObject(obj: IGameObject) {
        if(obj.instanceId > 0)
            this.removeObject(obj);

        obj.instanceId = this.instanceCount++;
        this.objects[obj.instanceId] = obj;
    }

    public removeObject(obj: IGameObject) {
        if(obj.instanceId == 0)
            return;

        delete this.objects[obj.instanceId];
        obj.instanceId = 0;
    }

    public getObject(instanceId: number): IGameObject {
        return this.objects[instanceId];
    }

    public getObjects(): {[key: number]: IGameObject} {
        return this.objects;
    }

    public sendTick() {
        let msg = new Tick(this.clientTick, this.serverTick);
        this.client.socket.emit(msg.getEventId(), msg);
    }

    /**
     * Send movement to server
     */
    public doMove(move: Move) {
        this.client.socket.emit(move.getEventId(), move);
        //console.log("Client Move: " + JSON.stringify(move));
    }

    /*public sendInput() {
        let inputState = {};
        for(let key in this.inputManager.keys)
            inputState[key] = this.inputManager.keys[key].isDown;

        let msg = new Input(inputState);
        this.client.socket.emit(msg.getEventId(), msg);
    }*/

    public sendAction(action: IAction) {
        let msg = new Action(action);
        this.client.socket.emit(msg.getEventId(), msg);
    }

    public handleDisconnect() {
        let style: Phaser.PhaserTextStyle = {
            font: "32px Arial",
            fill: "#000000",
            align: "center",
            backgroundColor: "#FFFFFF"
        };
        let text = this.add.text(this.width/2, this.height/2,
            "Disconnected from server! Reload page to re-connect!", style);
        text.anchor.set(0.5);
    }
}