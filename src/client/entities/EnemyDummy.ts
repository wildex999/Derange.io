
import {SyncedObject} from "../../common/sync/syncedobject";
import {Entity} from "../Entity";
import {Assets} from "../assets";
import * as p2js from "p2";

@SyncedObject()
export class EnemyDummy extends Entity {
    onSyncCreated() {
        super.onSyncCreated();

        this.sprite.loadTexture(Assets.enemy.key);

        //this.pivot.set(8, 8);
        this.sprite.anchor.setTo(0.5, 0.5);
        this.spriteOffsetX = -3;
        this.spriteOffsetY = -5;

        //Collision
        let shape = new p2js.Circle({radius:5});
        this.body.type = p2js.Body.STATIC;
        this.body.addShape(shape);
    }
}