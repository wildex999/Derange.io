
import {GameObject} from "../GameObject";
import {SyncedObject} from "../../common/sync/syncedobject";
import {SyncedMovement} from "../../common/SyncedMovement";
import {Sync} from "../../common/sync/Sync";
import {World} from "../world";

@SyncedObject()
export class EnemyDummy implements GameObject {
    instanceId: number;

    world: World;

    @Sync()
    position: SyncedMovement;

    constructor(world: World) {
        this.world = world;
        this.position = new SyncedMovement();
        this.position.historyTime = 100; //Allow for player to interpolate old positions
    }

    public setPosition(x: number, y: number) {
        this.position.setPosition(x, y);
    }

    onCreated() {

    }

    onUpdate(time: number) {

    }

    onDestroy() {

    }
}