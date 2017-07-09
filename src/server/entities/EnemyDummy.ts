
import {GameObject} from "../GameObject";
import {SyncedObject} from "../../common/sync/syncedobject";
import {SyncedMovement} from "../../common/SyncedMovement";
import {Sync} from "../../common/sync/Sync";
import {World} from "../world";
import {Entity} from "./entity";

@SyncedObject()
export class EnemyDummy extends Entity {
    instanceId: number;

    //@Sync()
    //position: SyncedMovement;

    constructor(world: World) {
        super(world);
        //this.position = new SyncedMovement();
        //this.position.historyTime = 100; //Allow for player to interpolate old positions
    }

    public setPosition(x: number, y: number) {
        //this.position.setPosition(x, y);
        this.position.x = x;
        this.position.y = y;
    }

    onCreated() {

    }

    onUpdate() {

    }

    onDestroy() {

    }
}