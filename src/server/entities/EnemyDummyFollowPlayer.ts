import {EnemyDummy} from "./EnemyDummy";
import {Entity} from "./Entity";

export class EnemyDummyFollowPlayer extends EnemyDummy {
    walkSpeed: number = 16;
    distanceLimit = 120;
    player: Entity;

    doMove() {
        if(!this.canMove) {
            this.body.velocity[0] = 0;
            this.body.velocity[1] = 0;
            return;
        }

        this.selectPlayer();
        if(this.player == null) {
            this.body.velocity[0] = 0;
            this.body.velocity[1] = 0;
            return;
        }

        let dx = this.player.body.position[0] - this.body.position[0];
        let dy = this.player.body.position[1] - this.body.position[1];
        let mag = Math.sqrt((dx*dx) + (dy*dy));
        dx = dx/mag;
        dy = dy/mag;

        this.body.velocity[0] = dx * this.walkSpeed;
        this.body.velocity[1] = dy * this.walkSpeed;
    }

    selectPlayer() {
        if(this.player != null) {
            if(this.getDistanceTo(this.player) > this.distanceLimit)
                this.player = null;
        }

        if(this.player == null) {
            //Find new player
            let closest: Entity;
            let closestDist: number = 1000000;
            for(let instanceId in this.world.players) {
                let player = <Entity>this.world.players[instanceId];
                let dist = this.getDistanceTo(player);
                if(dist < closestDist) {
                    closest = player;
                    closestDist = dist;
                }
            }

            if(closestDist <= this.distanceLimit)
                this.player = closest;
            else
                this.player = null;
        }
    }

    getDistanceTo(other: Entity) {
        let dx = Math.abs(other.body.position[0] - this.body.position[0]);
        let dy = Math.abs(other.body.position[1] - this.body.position[1]);
        return dx + dy;
    }
}