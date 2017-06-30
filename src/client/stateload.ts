import {Assets} from "./assets";
import {StateConnect} from "./stateconnect";

export class StateLoad extends Phaser.State {
    public static stateKey: string = "Load";

    /**
     * Load the game assets
     */
    preload() {
        Assets.game = this.game;

        Assets.player.load();
    }

    create() {
        //Set the Physics system
        this.game.physics.startSystem(Phaser.Physics.P2JS);

        this.state.start(StateConnect.stateKey);
    }
}