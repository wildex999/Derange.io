
import {AttackSlashSprite} from "./AttackSlashSprite";
import {AttackSlashLargeCommon} from "../../common/attacks/AttackSlashLargeCommon";

export class AttackSlashLargeSprite extends AttackSlashSprite {
    attack: AttackSlashLargeCommon;

    createSprite() {
        super.createSprite();
        if(this.attack.combo == 1)
            this.sprite.scale.setTo(0.40, 0.20);
        if(this.attack.combo == 2)
            this.sprite.scale.setTo(0.43, 0.23);
        if(this.attack.combo == 3)
            this.sprite.scale.setTo(0.50, 0.28);
    }
}