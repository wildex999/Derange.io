import {Sync} from "../common/sync/Sync";
import {SyncedObject} from "../common/sync/syncedobject";
import {SyncedMovement} from "../common/SyncedMovement";
import {World} from "./world";
import {GameObject} from "./GameObject";

@SyncedObject("Player")
export class PlayerServer implements GameObject {
    public instanceId: number;
    public world: World;

    @Sync()
    clientId: string;
    @Sync()
    position: SyncedMovement;

    constructor(clientId: string, world: World) {
        this.clientId = clientId;
        this.world = world;
        this.position = new SyncedMovement();
    }

    public setPosition(x: number, y: number) {
        this.position.setPosition(x, y);
    }

    public onCreated() {

    }

    public onUpdate(time: number) {
        this.position.updateServer(time);
    }

    public onDestroy() {

    }
}