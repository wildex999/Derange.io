
import {SyncedObject} from "./sync/syncedobject";
import {Sync} from "./sync/Sync";
import {IEvent} from "./IEvent";
import {ISyncedObject} from "./sync/ISyncedObject";

@SyncedObject()
export class SyncedEvents {
    time: number;

    @Sync()
    events: IEvent[];
    currentEvent: IEvent;

    public historyTime: number = 100; //How many milliseconds we retain events(TODO: This should match the number of ticks between network sync, more if we keep future movement too)
    public timeDelay: number = 0; //How many milliseconds behind to do the event
    public retainLast: boolean = true;

    public updateClient(time: number) {
        this.time = time - this.timeDelay;

        this.updateCurrent();
    }

    public updateServer(time: number) {
        this.time = time - this.timeDelay;

        //Remove old events
        let changed = false;
        while(this.events.length > 0) {
            if(this.events[0].time < this.time - this.historyTime) {
                if(this.events.length > 1 || !this.retainLast) {//Keep the last event around so other clients can get it
                    this.events.shift();
                    changed = true;
                } else
                    break;
            } else
                break;
        }

        if(changed) //We have to manually set arrays to sync for now
            (<ISyncedObject><any>this).markChanged("events");

        this.updateCurrent();
    }

    clearEvents() {
        this.events = [];
    }

    addEvent(event: IEvent) {
        this.events.push(event);
        (<ISyncedObject><any>this).markChanged("events");
    }

    /**
     * Check if we are at a new event
     */
    updateCurrent() {
        for(let event of this.events) {
            if(event.time <= this.time) {
                if(this.currentEvent == null || event.time >= this.currentEvent.time) { //The latest valid event is the current
                    //console.log("SetCurrent: " + JSON.stringify(this.currentEvent));
                    this.currentEvent = event;
                }
            } else
                break;
        }
    }
}