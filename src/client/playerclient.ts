
import {Sync} from "../common/sync/Sync";
import {Position} from "../common/position";
import {SyncedObject} from "../common/sync/syncedobject";
import {Sprite, CursorKeys} from "phaser-ce";
import {Game} from "./Game";
import {Move} from "../common/models/gameobject/move";
import {IGameObject} from "./IGameObject";
import {Assets} from "./assets";

@SyncedObject("Player", "onSyncCreated", "onSyncUpdate", "onSyncDestroy")
export class PlayerClient extends Sprite implements IGameObject{
    game: Game;
    cursor: CursorKeys;

    @Sync()
    clientId: string;

    @Sync("position")
    serverPosition: Position;

    public isLocal: boolean;

    public init(game: Game) {
        Phaser.Sprite.call(this, game, this.serverPosition.x, this.serverPosition.y, Assets.player.key);
        game.add.existing(this);
    }

    public onSyncCreated() {
        console.log("CREATED: " + this.game);
        this.isLocal = this.clientId == this.game.client.clientId;

        if(this.isLocal) {
            this.cursor = this.game.input.keyboard.createCursorKeys();
            this.game.camera.follow(this);
        }
    }

    public update() {
        if(!this.isLocal)
            return;

        let updated = false;
        let speed = 5;
        if(this.cursor.up.isDown) {
            updated = true;
            this.y -= speed;
        }
        if(this.cursor.down.isDown) {
            updated = true;
            this.y += speed;
        }
        if(this.cursor.left.isDown) {
            updated = true;
            this.x -= speed;
        }
        if(this.cursor.right.isDown) {
            updated = true;
            this.x += speed;
        }

        if(updated)
            this.game.doMove(new Move(this.x, this .y));
    }

    public onSyncUpdate() {
        console.log("SYNC");
        this.position.x = this.serverPosition.x;
        this.position.y = this.serverPosition.y;
    }

    public onSyncDestroy() {
        console.log("DESTROY");
    }

}