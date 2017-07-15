
import {EnemyDummy} from "./EnemyDummy";

export class WalkingEnemyDummy extends EnemyDummy {

    walkCount: number = 0;
    walkDir: number = -1;
    walkSpeed: number = 24;

    onUpdate() {
        super.onUpdate();

        if(!this.canMove) {
            if(this.walkCount++ > 24) {
                this.walkDir = -1 * this.walkDir;
                this.walkCount = 0;
            }

            this.body.velocity[0] = this.walkDir * this.walkSpeed;
        }
    }
}