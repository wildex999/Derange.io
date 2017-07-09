
import {SyncedObject} from "../../common/sync/syncedobject";
import {World} from "../world";
import {Entity} from "./entity";
import * as p2js from "p2";

@SyncedObject()
export class EnemyDummy extends Entity {

    constructor(world: World) {
        super(world);
    }

    onCreated() {
        let shape = new p2js.Circle({radius:5});
        this.body.type = p2js.Body.STATIC;
        this.body.addShape(shape);

        super.onCreated();
    }

    onUpdate() {
        super.onUpdate();
    }

    onDestroy() {
        super.onDestroy();
    }
}