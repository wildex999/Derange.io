
import Sprite = Phaser.Sprite;
import {Game} from "../Game";
import {Assets} from "../assets";
import * as p2js from 'p2';
import Graphics = Phaser.Graphics;
import {AttackSlashCommon} from "../../common/attacks/AttackSlashCommon";
import {Entity} from "../entities/Entity";
import {IAttack} from "../../common/attacks/IAttack";

export class AttackSlash implements IAttack {
    public attackId = AttackSlashCommon.attackId;

    game: Game;
    source: Entity;
    angle: number;

    sprite: Sprite;
    debug: Graphics;
    life: number;
    body: p2js.Body;

    constructor(game: Game, source: Entity, angle: number) {
        this.game = game;
        this.source = source;
        this.angle = angle;

        let x = source.body.position[0];
        let y = source.body.position[1];

        this.sprite = game.add.sprite(x, y, Assets.attackSlash.key);
        this.sprite.anchor.setTo(0.55, 1.7);
        this.sprite.scale.setTo(0.3, 0.15);
        this.sprite.angle = angle;

        this.life = AttackSlashCommon.lifeTime;

        this.body = AttackSlashCommon.createBody(false);
        this.body.angle = angle * Math.PI / 180;
        this.body.position[0] = x;
        this.body.position[1] = y;
        (<any>this.body).parent = this;

        game.physicsWorld.addBody(this.body);

        if(game.debugServerPosition) {
            this.debug = game.add.graphics(this.body.position[0], this.body.position[1]);
            this.debug.beginFill(0xFF0000);
            this.debug.drawPolygon(AttackSlashCommon.colliderVertices);
            this.debug.angle = angle;
            game.myCam.add(this.debug);
        }

        game.myCam.add(this.sprite);
    }

    public update(): boolean {
        this.body.position[0] = this.source.body.position[0];
        this.body.position[1] = this.source.body.position[1];

        if(this.life-- == 0) {
            this.destroy();
            return false;
        }

        this.sprite.x = this.body.position[0];
        this.sprite.y = this.body.position[1];

        this.source.body.velocity[0] = Math.cos((this.angle-90) * Math.PI / 180) * 2;
        this.source.body.velocity[1] = Math.sin((this.angle-90) * Math.PI / 180) * 2;

        if(this.debug) {
            this.debug.x = this.body.position[0];
            this.debug.y = this.body.position[1];
        }

        return true;
    }

    public destroy() {
        this.sprite.destroy();
        if(this.debug)
            this.debug.destroy();
        this.game.physicsWorld.removeBody(this.body);
    }
}