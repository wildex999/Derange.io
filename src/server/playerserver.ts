import {Sync} from "../common/sync/Sync";
import {SyncedObject} from "../common/sync/syncedobject";
import {World} from "./world";
import {Entity} from "./entities/entity";
import {Input} from "../common/models/Input";
import {ISyncedObject} from "../common/sync/ISyncedObject";
import {Keys} from "../common/Keys";

import * as p2js from "p2"
import {IAction} from "../common/IAction";
import {Actions} from "../common/Actions";
import {ActionMove} from "../common/actions/ActionMove";
import {Client} from "./client";

@SyncedObject("Player")
export class PlayerServer extends Entity {

    @Sync()
    clientId: string;
    //@Sync()
    //position: SyncedMovement;
    clientActions: IAction[];

    constructor(clientId: string, world: World) {
        super(world);

        this.clientId = clientId;
        this.clientActions = [];
        //this.position = new SyncedMovement();
        //this.position.historyTime = 100; //Allow for player to interpolate old positions
    }

    /*public updateInput(inputDelta: Input) {
        let changed = false;
        for(let key in inputDelta.inputChange) {
            let newState = inputDelta.inputChange[key];
            if(!newState) {
                delete this.clientInput[key];
                changed = true;
            } else if(this.clientInput[key] != newState) {
                this.clientInput[key] = true;
                changed = true;
            }
        }
    }*/

    public onAction(action: IAction) {
        this.clientActions.push(action);
    }

    public onCreated() {
        this.body.type = p2js.Body.DYNAMIC;
        this.body.addShape(new p2js.Circle({radius:5}));

        super.onCreated();
    }

    public onUpdate() {
        this.setVelocity(0,0);

        //Handle actions
        let hasMoved = false;
        for(let action of this.clientActions) {
            switch(action.action) {
                case Actions.Move:
                    if(hasMoved) {
                        console.log("UNHANDLED: " + JSON.stringify(action));
                        break;
                    }
                    hasMoved = true;

                    let moveAction: ActionMove = <ActionMove>action;

                    //Update velocity
                    let speed = 32;
                    let vx: number = 0;
                    let vy: number = 0;
                    if (moveAction.up) {
                        vy -= speed;
                    }
                    if (moveAction.down) {
                        vy += speed;
                    }
                    if (moveAction.left) {
                        vx -= speed;
                    }
                    if (moveAction.right) {
                        vx += speed;
                    }
                    this.setVelocity(vx, vy);
                    let client: Client = this.world.syncer.clients[this.clientId];
                    //console.log("Move: " + client.clientTick + " Pos: " + this.body.position[0] + " | " + this.body.position[1] + " Vel: " + this.body.velocity[0] + " | " + this.body.velocity[1]);
                    break;
            }
        }
        this.clientActions = [];

        super.onUpdate();
        //console.log("Pos: " + JSON.stringify(this.body.position), " Vel: " + JSON.stringify(this.body.velocity));
    }

    public onDestroy() {
        super.onDestroy();
    }
}
