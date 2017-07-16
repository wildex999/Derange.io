import {AttackSprite} from "./AttackSprite";
import {Assets} from "../assets";
import {AttackSlashCommon} from "../../common/attacks/AttackSlashCommon";
import {Game} from "../Game";

export class AttackSlashSprite extends AttackSprite {
    attack: AttackSlashCommon;

    constructor(game: Game, attack: AttackSlashCommon) {
        super(game, attack);
        this.attack = attack;
    }

    public update() {
    }

    createSprite() {
        let pos = this.attack.getPosition();
        this.sprite = this.game.add.sprite(pos.x, pos.y, Assets.attackSlash.key);
        this.sprite.anchor.setTo(0.55, 1.7);
        this.sprite.scale.setTo(0.3, 0.15);
        this.sprite.angle = this.attack.angle;

        if(this.game.debugServerPosition) {
            this.debug = this.game.add.graphics(pos.x, pos.y);
            this.debug.beginFill(0xFF0000);
            this.debug.drawPolygon(this.attack.colliderVertices);
            this.debug.angle = this.attack.angle;
        } else
            this.debug = null;

        super.createSprite();
    }
}