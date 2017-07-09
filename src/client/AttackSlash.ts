
import Sprite = Phaser.Sprite;
import {Game} from "./Game";
import {Assets} from "./assets";
import * as p2js from 'p2';
import Graphics = Phaser.Graphics;

export class AttackSlash {
    game: Game;
    sprite: Sprite;
    t: Graphics;
    life: number;
    body: p2js.Body;

    constructor(game: Game, x: number, y: number, angle: number) {
        this.game = game;

        this.sprite = game.add.sprite(x, y, Assets.attackSlash.key);
        this.sprite.update = () => this.update();
        this.sprite.anchor.setTo(0.55, 1.7);
        this.sprite.scale.setTo(0.3, 0.15);
        this.sprite.angle = angle;

        this.life = 10;

        this.body = new p2js.Body();
        this.body.mass = 0;
        this.body.setDensity(0);
        let vertices = [[0,0], [-15, -12], [-10, -17], [-6, -20], [-0, -21], [6, -20], [10, -17], [15, -12]];
        //console.log("C: " + this.body.fromPolygon(vertices));
        let shape = new p2js.Convex();
        //let shape = new p2js.Circle({radius: 50});
        shape.sensor = true;
        shape.vertices = vertices;
        this.body.type = p2js.Body.DYNAMIC;
        this.body.angle = angle * Math.PI / 180;
        this.body.position[0] = x;
        this.body.position[1] = y;
        //this.body.velocity[1] = 1;
        (<any>this.body).parent = this;
        this.body.addShape(shape);
        shape.sensor = true;
        this.body.shapes[0].sensor = true;
        game.physicsWorld.addBody(this.body);

        if(game.debugServerPosition) {
            this.t = game.add.graphics(this.body.position[0], this.body.position[1]);
            this.t.beginFill(0xFF0000);
            this.t.drawPolygon(vertices);
            this.t.angle = angle;
            game.myCam.add(this.t);
        }

        game.myCam.add(this.sprite);
    }

    update() {
        this.sprite.y -= 0.05;
        if(this.life-- == 0) {
            this.sprite.destroy();
            if(this.t)
                this.t.destroy();
            this.game.physicsWorld.removeBody(this.body);
        }

        if(this.t) {
            this.t.x = this.body.position[0];
            this.t.y = this.body.position[1];
        }
        //console.log("T: " + this.t.x + " | " + this.t.y);
    }

    onBeginContact(otherBody: p2js.Body, shape: p2js.Shape, otherShape: p2js.Shape) {
        let other = (<any>otherBody).parent;
        let name = "Unknown";
        if(other != null)
            name = other.syncObjectId;
        console.log("CONTACT SLASH: " + name);
    }
}