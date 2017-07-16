
import {AttackSlashCommon} from "./AttackSlashCommon";
import {IEntity} from "../entities/IEntity";
import {PushMovement} from "../movementmodifiers/PushMovement";
import {Vector} from "../Vector";

export class AttackSlashLargeCommon extends AttackSlashCommon {
    static colliderVertices1 = [[0,0], [-17, -15], [-13, -20], [-8, -25], [-0, -30], [8, -25], [13, -20], [17, -15]];
    static colliderVertices2 = [[0,0], [-20, -20], [-15, -25], [-10, -30], [-0, -35], [10, -30], [15, -25], [20, -20]];
    static colliderVertices3 = [[0,0], [-25, -25], [-20, -30], [-15, -35], [-0, -40], [15, -35], [20, -30], [25, -25]];

    combo: number;
    playerPush = 30;

    life = 15;
    playerPushTime = 5;
    playerStunTime = this.life;

    constructor(source: IEntity, angle: number, combo: number) {
        super(source, angle);

        this.combo = combo;
    }

    setup() {
        if(this.combo == 0)
            this.colliderVertices = AttackSlashCommon.colliderVertices0;
        if(this.combo == 1)
            this.colliderVertices = AttackSlashLargeCommon.colliderVertices1;
        if(this.combo == 2)
            this.colliderVertices = AttackSlashLargeCommon.colliderVertices2;
        if(this.combo == 3)
            this.colliderVertices = AttackSlashLargeCommon.colliderVertices3;
    }
}