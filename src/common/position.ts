
import {SyncedObject} from "./sync/syncedobject";
import {Sync} from "./sync/Sync";

@SyncedObject()
export class Position {
    @Sync()
    public x: number;
    @Sync()
    public y: number;

    constructor(x?: number, y?: number) {
        this.x = x;
        this.y = y;
    }
}