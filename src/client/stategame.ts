import {Game} from "./Game";
import {ClientSyncer} from "./ClientSyncer";

export class StateGame extends Phaser.State {
    public static stateKey: string = "Game";

    create() {
        let game: Game = <Game>this.game;

        game.world.setBounds(0, 0, 3000, 3000);

        //Setup handlers and syncing
        let syncer = new ClientSyncer(game.client.socket, game);
        syncer.defineClientObjects();

        //Tell the server that we are joining the world, and wait for sync updates.
        game.client.joinWorld();
    }

    update() {

    }
}