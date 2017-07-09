
import {Game} from "./Game";

export interface IGameObject {
    instanceId: number; //Set when adding to game

    /**
     * Called when the object is created.
     * This should add it to the world, setup sprite, physics etc.
     * @param game
     */
    init(game: Game);
    update();
    destroy();
}