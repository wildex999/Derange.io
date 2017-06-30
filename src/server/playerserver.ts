
import {Position} from "../common/position";
import {Sync} from "../common/sync/Sync";
import {SyncedObject} from "../common/sync/syncedobject";

@SyncedObject("Player")
export class PlayerServer {
    public instanceId: number;

    @Sync()
    clientId: string;
    @Sync()
    position: Position;

    constructor(clientId: string) {
        this.clientId = clientId;
        this.position = new Position(0, 0);
    }

    public onCreated() {

    }

    public onUpdate() {

    }

    public onDestroy() {

    }
}