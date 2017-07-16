
import Sprite = Phaser.Sprite;
import Graphics = Phaser.Graphics;
import {Game} from "../Game";
import {IAttack} from "../../common/attacks/IAttack";

export abstract class AttackSprite {
    sprite: Sprite;
    debug: Graphics;
    game: Game;
    attack: IAttack;

    constructor(game: Game, attack: IAttack) {
        this.game = game;
        this.attack = attack;
    }

    public createSprite() {
        if(this.debug)
            this.game.myCam.add(this.debug);
        if(this.sprite)
            this.game.myCam.add(this.sprite);
    }

    public update() {
        let pos = this.attack.getPosition();
        this.sprite.x = pos.x;
        this.sprite.y = pos.y;

        if(this.debug) {
            this.debug.x = pos.x;
            this.debug.y = pos.y;
        }
    }

    public destroy() {
        this.sprite.destroy();
        if(this.debug)
            this.debug.destroy();
    }
}