import {Assets} from "./assets";
import {StateConnect} from "./stateconnect";
import {Game} from "./Game";
import {InputManager} from "./InputManager";

export class StateLoad extends Phaser.State {
    public static stateKey: string = "Load";

    game: Game;

    /**
     * Load the game assets
     */
    preload() {
        this.game.stage.disableVisibilityChange = true; //Keep the game running when not in focus

        this.game.layerFront = this.game.add.group();
        this.game.layerMid = this.game.add.group();
        this.game.layerBack = this.game.add.group();

        Assets.game = this.game;

        Assets.player.load();
        Assets.enemy.load();
        
        Assets.tileSet.load();

        this.game.inputManager = new InputManager(this.game);
    }

    create() {
        //Set the Physics system
        this.game.physics.startSystem(Phaser.Physics.P2JS);

        this.state.start(StateConnect.stateKey);
    }
}