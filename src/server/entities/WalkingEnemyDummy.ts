
import {EnemyDummy} from "./EnemyDummy";

export class WalkingEnemyDummy extends EnemyDummy {

    walkCount: number = 0;
    walkDir: number = -1;
    walkSpeed: number = 24;

    doMove() {
        if(this.canMove) {
            if(this.walkCount++ > 240) {
                this.walkDir = -1 * this.walkDir;
                this.walkCount = 0;
            }

            this.body.velocity[0] = this.walkDir * this.walkSpeed;
        }
    }
}