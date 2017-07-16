
import {IEntity} from "./IEntity";
import {Tags} from "../Tags";

export abstract class EntityCommon implements IEntity {
    public tags: string[];

    public abstract setPosition(x: number, y: number);
    public abstract getPosition();
    public abstract setVelocity(x: number, y: number);
    public abstract getVelocity();

    constructor() {
        this.tags = [Tags.Entity];
    }
}