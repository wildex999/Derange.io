
import {Game} from "./Game";

export interface IGameObject {
    /**
     * Called when the object is created.
     * This should add it to the world, setup sprite, physics etc.
     * @param game
     */
    init(game: Game);
}