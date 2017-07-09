
import {GameObject} from "../GameObject";
import {SyncedObject} from "../../common/sync/syncedobject";
import {Vector} from "../../common/Vector";
import {Sync} from "../../common/sync/Sync";
import {World} from "../world";

import * as p2js from "p2"
import {GameMath} from "../../common/GameMath";

@SyncedObject()
export class Entity implements GameObject {
    public instanceId: number;
    public world: World;

    body: p2js.Body;

    @Sync()
    position: Vector;
    @Sync()
    velocity: Vector;

    constructor(world: World) {
        this.world = world;
        this.position = new Vector();
        this.velocity = new Vector();

        this.body = new p2js.Body();
        this.body.mass = 1;
        this.body.fixedRotation = 0;
        this.body.damping = 0;
    }

    public setPosition(x: number, y: number) {
        this.body.position[0] = GameMath.scale(x);
        this.body.position[1] = GameMath.scale(y);
    }

    public setVelocity(x: number, y: number) {
        this.body.velocity[0] = GameMath.scale(x);
        this.body.velocity[1] = GameMath.scale(y);
    }

    onCreated() {
        console.log("Add body");
        this.world.physicsWorld.addBody(this.body);
    }

    onUpdate() {
        //Make sure the position is scaled to two decimal places for more accurate simulation between clients
        this.setPosition(this.body.position[0], this.body.position[1]);

        //Update position and velocity from physics body
        this.position.x = GameMath.scale(this.body.position[0]);
        this.position.y = GameMath.scale(this.body.position[1]);

        this.velocity.x = GameMath.scale(this.body.velocity[0]);
        this.velocity.y = GameMath.scale(this.body.velocity[1]);
    }

    onDestroy() {
        this.world.physicsWorld.removeBody(this.body);
    }
}