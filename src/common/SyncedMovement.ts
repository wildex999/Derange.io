
import {Movement} from "./Movement";
import {SyncedObject} from "./sync/syncedobject";
import {Sync} from "./sync/Sync";
import {Move} from "./models/gameobject/move";
import {ISyncedObject} from "./sync/ISyncedObject";
import {SyncedEvents} from "./SyncedEvents";

export class SyncedMovement extends SyncedEvents{

    _x: number;
    public get x(): number { return this._x; }
    _y: number;
    public get y(): number { return this._y; }

    constructor() {
        super();
        this.setPosition(0,0);
    }

    /**
     * Sets the current position.
     * Note: Invalidates any planned movement
     */
    public setPosition(x: number, y: number) {
        this.clearEvents();
        this.addEvent(new Movement(this.time, x, y, 0, 0));
    }

    public updateClient(time: number) {
        super.updateClient(time);
        this.updateMovement();
    }

    public updateServer(time: number) {
        super.updateServer(time);
        this.updateMovement();
    }

    public doMove(move: Move, time: number) {
        this.addEvent(new Movement(time, move.startX, move.startY, move.deltaX, move.deltaY));
        //console.log("DoMove: " + JSON.stringify(this.events));
    }

    /**
     * Updater position according to current movement
     */
    updateMovement() {
        if(this.currentEvent == null)
            return;

        let current: Movement = <Movement>this.currentEvent;

        let timeDiff = this.time - current.time;
        this._x = (current.startX + (timeDiff * (current.deltaX/1000)));
        this._y = (current.startY + (timeDiff * (current.deltaY/1000)));
        //console.log("Update: " + timeDiff + " | " + this._x + " | " + this._y + " | dx: " + current.deltaX + " | " + current.deltaY + " | " + JSON.stringify(current));
    }
}