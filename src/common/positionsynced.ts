
import {SyncedObject} from "./sync/syncedobject";
import {Sync} from "./sync/Sync";

@SyncedObject(null)
export class PositionSynced {
    @Sync()
    public x: number;
    @Sync()
    public y: number;

    constructor(x?: number, y?: number) {
        this.x = x || 0;
        this.y = y || 0;
    }
}