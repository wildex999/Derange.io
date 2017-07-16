import * as p2js from "p2"
import {CollisionGroups} from "../CollisionGroups";
import {IAttack} from "./IAttack";
import {IEntity} from "../entities/IEntity";
import {SlowMovement} from "../movementmodifiers/SlowMovement";
import {Vector} from "../Vector";

export class AttackSlashCommon implements IAttack {
    static colliderVertices0 = [[0,0], [-15, -12], [-10, -17], [-6, -20], [-0, -21], [6, -20], [10, -17], [15, -12]];

    colliderVertices;

    public attackId = "slash";

    body: p2js.Body;
    source: IEntity;
    angle: number;

    life = 10;
    slowTime = 5;
    slowAmount = 2;

    constructor(source: IEntity, angle: number) {
        this.source = source;
        this.angle = angle;
    }

    public createBody(includeCollide: boolean) {
        this.setup();

        this.body = new p2js.Body();
        this.body.mass = 0;
        this.body.setDensity(0);

        if(includeCollide)
            this.addColliderShape();

        this.body.angle = this.angle * Math.PI / 180;
        let sourcePos = this.source.getPosition();
        this.body.position[0] = sourcePos.x;
        this.body.position[1] = sourcePos.y;
        (<any>this.body).parent = this;
    }

    public update(): boolean {
        let sourcePosition = this.source.getPosition();
        this.body.position[0] = sourcePosition.x;
        this.body.position[1] = sourcePosition.y;

        if(this.life-- == 0) {
            this.destroy();
            return false;
        }

        return true;
    }

    public destroy() {};

    public getPosition(): Vector {
        return new Vector(this.body.position[0], this.body.position[1]);
    }

    setup() {
        this.colliderVertices = AttackSlashCommon.colliderVertices0;
    }

    addColliderShape() {
        let shape = new p2js.Convex();
        //let shape = new p2js.Circle({radius: 50});
        shape.sensor = true;
        shape.vertices = this.colliderVertices;
        shape.collisionGroup = CollisionGroups.ATTACK;
        shape.collisionMask = CollisionGroups.ENEMY | CollisionGroups.PLAYER;
        this.body.type = p2js.Body.DYNAMIC;
        this.body.addShape(shape);
        shape.sensor = true;
    }
}