
export interface GameObject {
    instanceId: number;

    onCreated(); //Instance has been added to the world
    onUpdate(time: number); //Update instance in world
    onDestroy(); //Instance is about to be removed from world
}