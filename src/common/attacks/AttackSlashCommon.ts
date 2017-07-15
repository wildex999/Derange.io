import * as p2js from "p2"
import {CollisionGroups} from "../CollisionGroups";

export class AttackSlashCommon {
    public static colliderVertices = [[0,0], [-15, -12], [-10, -17], [-6, -20], [-0, -21], [6, -20], [10, -17], [15, -12]];
    public static lifeTime = 10;
    public static lungeTime = 5;
    public static attackId = "slash";

    public static createBody(includeCollide: boolean): p2js.Body {
        let body = new p2js.Body();
        body.mass = 0;
        body.setDensity(0);

        //console.log("C: " + this.body.fromPolygon(vertices));
        if(includeCollide) {
            let shape = new p2js.Convex();
            //let shape = new p2js.Circle({radius: 50});
            shape.sensor = true;
            shape.vertices = AttackSlashCommon.colliderVertices;
            shape.collisionGroup = CollisionGroups.ATTACK;
            shape.collisionMask = CollisionGroups.ENEMY | CollisionGroups.PLAYER;
            body.type = p2js.Body.DYNAMIC;
            body.addShape(shape);
            shape.sensor = true;
        }

        return body;
    }
}