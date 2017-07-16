
import {SyncedObject} from "../../common/sync/syncedobject";
import {Vector} from "../../common/Vector";
import {Sync} from "../../common/sync/Sync";
import {World} from "../world";

import * as p2js from "p2"
import {GameMath} from "../../common/GameMath";
import {EntityCommon} from "../../common/entities/EntityCommon";
import {IGameObject} from "../IGameObject";
import {MovementModifier} from "../../common/movementmodifiers/MovementModifier";

@SyncedObject()
export class Entity extends EntityCommon implements IGameObject {
    @Sync()
    public instanceId: number;
    public world: World;

    body: p2js.Body;
    movementModifier: MovementModifier;

    @Sync()
    position: Vector;
    @Sync()
    velocity: Vector;
    @Sync()
    canMove: boolean;

    constructor(world: World) {
        super();

        this.world = world;
        this.position = new Vector();
        this.velocity = new Vector();

        this.canMove = true;

        this.body = new p2js.Body();
        this.body.mass = 1;
        this.body.fixedRotation = 0;
        this.body.damping = 0;
        (<any>this.body).parent = this;
    }

    public setPosition(x: number, y: number) {
        this.body.position[0] = GameMath.scale(x);
        this.body.position[1] = GameMath.scale(y);
    }

    public setVelocity(x: number, y: number) {
        this.body.velocity[0] = GameMath.scale(x);
        this.body.velocity[1] = GameMath.scale(y);
    }

    public getPosition(): Vector {
        return new Vector(this.body.position[0], this.body.position[1]);
    }

    public getVelocity(): Vector {
        return new Vector(this.body.velocity[0], this.body.velocity[1]);
    }

    onCreated() {
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

    public setMovementModifier(modifier: MovementModifier) {
        if(this.movementModifier != null)
            this.movementModifier.onRemove();

        this.movementModifier = modifier;
        if(modifier != null)
            modifier.onAdd(this);
    }

    preMovement() {
        this.setVelocity(0,0);

        //Check if the Movement Modifier is stopping movement input
        if(this.movementModifier)
            this.canMove = !this.movementModifier.takeControl;
        else
            this.canMove = true;
    }

    updateMovement() {
        if(this.movementModifier != null) {
            if(!this.movementModifier.onUpdate()) {
                this.movementModifier.onRemove();
                this.movementModifier = null;
            }
        }
    }

}