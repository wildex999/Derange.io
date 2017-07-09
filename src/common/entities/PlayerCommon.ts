import * as p2js from "p2";

export class PlayerCommon {
    public static createCollider(body: p2js.Body) {
        let shape = new p2js.Circle({radius:5});
        body.addShape(shape);
    }
}