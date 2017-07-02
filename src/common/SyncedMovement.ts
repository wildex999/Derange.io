
import {Movement} from "./Movement";
import {SyncedObject} from "./sync/syncedobject";
import {Sync} from "./sync/Sync";
import {Move} from "./models/gameobject/move";
import {ISyncedObject} from "./sync/ISyncedObject";

@SyncedObject(null)
export class SyncedMovement {
    time: number;

    @Sync()
    movement: Movement[];
    currentMovement: Movement;

    historyTime: number = 100; //How many milliseconds we retain movement(TODO: This should match the number of ticks between network sync, more if we keep future movement too)
    timeDelay: number = 0; //How many milliseconds behind to do the movement

    _x: number;
    public get x(): number { return this._x; }
    _y: number;
    public get y(): number { return this._y; }

    constructor() {
        this.setPosition(0,0);
    }

    /**
     * Sets the current position.
     * Note: Invalidates any planned movement
     */
    public setPosition(x: number, y: number) {
        this.movement = [new Movement(this.time, x, y, 0, 0)];
    }

    public updateClient(time: number) {
        this.time = time - this.timeDelay;

        this.updateCurrent();
        this.updateMovement();
    }

    public updateServer(time: number) {
        this.time = time - this.timeDelay;

        //Remove old movement
        let changed = false;
        while(this.movement.length > 0) {
            if(this.movement[0].time < this.time - this.historyTime) {
                if(this.movement.length > 1) {//We always keep the last movement around so other clients can get it
                    this.movement.shift();
                    changed = true;
                } else
                    break;
            } else
                break;
        }

        if(changed) //We have to manually set arrays to sync for now
            (<ISyncedObject><any>this).markChanged("movement");

        this.updateCurrent();
        this.updateMovement();
    }

    public doMove(move: Move, time: number) {
        this.movement.push(new Movement(time, move.startX, move.startY, move.deltaX, move.deltaY));
        (<ISyncedObject><any>this).markChanged("movement");
        //console.log("DoMove: " + JSON.stringify(this.movement));
    }

    /**
     * Check if we are at a new movement
     */
    updateCurrent() {
        for(let move of this.movement) {
            if(move.time <= this.time) {
                if(this.currentMovement == null || move.time > this.currentMovement.time) {
                    //console.log("SetCurrent: " + JSON.stringify(this.currentMovement));
                    this.currentMovement = move;
                    break;
                }
            }
        }
    }

    /**
     * Updater position according to current movement
     */
    updateMovement() {
        if(this.currentMovement == null)
            return;

        let timeDiff = this.time - this.currentMovement.time;
        this._x = (this.currentMovement.startX + ((timeDiff/1000) * this.currentMovement.deltaX));
        this._y = (this.currentMovement.startY + ((timeDiff/1000) * this.currentMovement.deltaY));
        //console.log("Update: " + timeDiff + " | " + this._x + " | " + this._y);
    }
}