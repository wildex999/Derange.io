import * as p2js from "p2";
import {CollisionGroups} from "../CollisionGroups";

export class PlayerCommon {
    public static createCollider(body: p2js.Body) {
        let shape = new p2js.Circle({radius:5});
        shape.collisionGroup = CollisionGroups.PLAYER;
        shape.collisionMask = CollisionGroups.TILE | CollisionGroups.ATTACK | CollisionGroups.PLAYER | CollisionGroups.ENEMY;
        body.addShape(shape);
    }
}