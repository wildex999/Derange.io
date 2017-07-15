import {EnemyDummy} from "./EnemyDummy";
import {Entity} from "./Entity";

export class EnemyDummyFollowPlayer extends EnemyDummy {
    walkSpeed: number = 16;

    onUpdate() {
        super.onUpdate();

        let player: Entity = this.world.players[Object.keys(this.world.players)[0]];
        if(player == null) {
            this.body.velocity[0] = 0;
            this.body.velocity[1] = 0;
            return;
        }

        if(this.canMove) {
            let dx = player.body.position[0] - this.body.position[0];
            let dy = player.body.position[1] - this.body.position[1];
            let mag = Math.sqrt((dx*dx) + (dy*dy));
            dx = dx/mag;
            dy = dy/mag;

            this.body.velocity[0] = dx * this.walkSpeed;
            this.body.velocity[1] = dy * this.walkSpeed;
        }
    }
}