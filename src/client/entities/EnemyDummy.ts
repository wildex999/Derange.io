
import Sprite = Phaser.Sprite;
import {Game} from "../Game";
import P2 = Phaser.Physics.P2;
import {IGameObject} from "../IGameObject";
import {SyncedMovement} from "../../common/SyncedMovement";
import {Sync} from "../../common/sync/Sync";
import {Assets} from "../assets";
import {SyncedObject} from "../../common/sync/syncedobject";
import {Vector} from "../../common/Vector";

@SyncedObject(null, "onSyncCreated")
export class EnemyDummy extends Sprite implements IGameObject {
    instanceId: number;
    game: Game;
    body: P2.Body;

    //@Sync("position")
    //serverPosition: SyncedMovement;
    @Sync("position")
    serverPosition: Vector;

    public init(game: Game) {
        Phaser.Sprite.call(this, game, this.serverPosition.x, this.serverPosition.y, Assets.enemy.key);

        //this.pivot.set(8, 8);
        this.anchor.setTo(0.5, 0.5);

        this.game.layerMid.add(this);
    }

    public onSyncCreated() {
        console.log("CREATED: " + this.game);

        this.game.physics.p2.enable(this);
        this.body.setZeroDamping();
        this.body.setZeroVelocity();
        this.body.setZeroRotation();
        this.body.setZeroForce();
        this.body.fixedRotation = true;

        //Set initial position
        //this.serverPosition.updateClient(this.game.clientTick);
        this.body.reset(this.serverPosition.x, this.serverPosition.y, true, true);
        this.anchor.setTo(0.5, 0.5);

        //Collision
        //let shape = this.body.setCircle(5, -1, 5);
        let shape = this.body.addPolygon({}, [[0,0],[10,-10],[20,0],[0,0]]);
        this.body.data.shapes[0].sensor = true;
        //shape.sensor = true;
        this.body.onBeginContact.add(() => {
            console.log("CONTACT");
        }, this);
        this.body.onEndContact.add(() => {
            console.log("END CONTACT");
        }, this);
        this.body.debug = true;
        this.game.myCam.add(this.body.debugBody);

        //this.serverPosition.timeDelay = 100; //Allow for some lag

        //Set initial position
        //this.serverPosition.updateClient(this.game.clientTime);
        this.body.reset(this.serverPosition.x, this.serverPosition.y);
    }

    public update() {
        this.body.setZeroVelocity();
        this.body.setZeroForce();

        //this.serverPosition.updateClient(this.game.clientTime);
        //console.log("Test: " + JSON.stringify(this.serverPosition.events));
        //console.log("MOVE: " + this.serverPosition.currentEvent.time + " > " + this.game.clientTime + " = " + this.serverPosition.x + " | " + this.serverPosition.y + " Delta: " + (this.serverPosition.x - this.x) + " | " + (this.serverPosition.y - this.y));
        this.body.reset(this.serverPosition.x, this.serverPosition.y);
    }
}