import {Game} from "./Game";
import Point = Phaser.Point;

export class Camera extends Phaser.Group {
    bounds: Phaser.Rectangle;
    stalker: Phaser.Sprite;
    target: any;

    constructor(game: Game) {
        super(game);

        this.bounds = Phaser.Rectangle.clone(game.world.bounds);
        this.zoomTo(1);

        this.stalker = game.add.sprite(0,0, null);
    }

    public follow(target: any) {
        this.target = target;
    }

    public update() {
        super.update();

        if(this.target) {
            this.stalker.x = this.target.x;
            this.stalker.y = this.target.y;
            //console.log("Stalker :" + this.stalker.x + " | " + this.stalker.y);

            this.x = -(this.stalker.x * this.scale.x) + ((this.game.width/2) - (this.stalker.pivot.x * this.scale.x));
            this.y = -(this.stalker.y * this.scale.y) + ((this.game.height/2) - (this.stalker.pivot.y * this.scale.y));
        }
    }

    public zoomTo(scale: number) {
        this.scale.setTo(scale);
    }

    public screenToCamera(point: Point): Point {
        let x = (point.x - this.x) / this.scale.x;
        let y = (point.y - this.y) / this.scale.y;
        return new Point(x, y);
    }
}