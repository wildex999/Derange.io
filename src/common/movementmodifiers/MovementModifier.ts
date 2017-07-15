/**
 * A movement modifier will apply velocity to an Entity over time.
 * For Example: When the player is hit, we want to take control and push the player a specific amount for a certain amount of time.
 * A modifier will always run after player/AI control input, unless takeControl is true.
 */
import {IEntity} from "../entities/IEntity";

export abstract class MovementModifier {
    public takeControl: boolean; //Stop control from the entity(Both player and AI)
    public exclusive: boolean; //If true, all other modifiers are removed

    public abstract onAdd(entity: IEntity); //Modifier has been added to Entity
    public abstract onUpdate(): boolean; //Single tick update on Entity. Return false to indicate it should be removed.
    public abstract onRemove(); //Modifier has been removed from Entity
}