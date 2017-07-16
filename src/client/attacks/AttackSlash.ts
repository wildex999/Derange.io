
import {Game} from "../Game";
import {AttackSlashCommon} from "../../common/attacks/AttackSlashCommon";
import {AttackSprite} from "./AttackSprite";
import {AttackSlashSprite} from "./AttackSlashSprite";
import {IAttack} from "../../common/attacks/IAttack";
import {Vector} from "../../common/Vector";

export class AttackSlash implements IAttack {
    game: Game;
    slash: AttackSlashCommon;
    sprite: AttackSprite;

    constructor(game: Game, slash: AttackSlashCommon, spriteClass: typeof AttackSlashSprite) {
        this.game = game;
        this.slash = slash;

        this.slash.createBody(false);
        game.physicsWorld.addBody(this.slash.body);

        this.sprite = new spriteClass(game, slash);
        this.sprite.createSprite();
    }

    public get attackId(): string {
        return this.slash.attackId;
    }

    public createBody(includeCollide: boolean) {
        this.slash.createBody(includeCollide);
    }

    public update(): boolean {
        if(!this.slash.update()) {
            this.destroy();
            return false;
        }

        this.sprite.update();

        return true;
    }

    public destroy() {
        this.sprite.destroy();
        this.game.physicsWorld.removeBody(this.slash.body);

        this.slash.destroy();
    }

    public getPosition(): Vector {
        return this.slash.getPosition();
    }

}