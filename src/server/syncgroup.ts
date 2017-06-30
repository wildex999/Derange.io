import {Client} from "./client";

/**
 * Groups a number of SyncObjects.
 * Used to only sync groups relevant to a specific client.
 */
export class SyncGroup {
    clients: {[key: number]: Client}; //key is clientId
    syncObjects: {[key: number]: object}; //key is instanceId

    constructor() {
        this.clients = {};
        this.syncObjects = {};
    }

    public addClient(clientId: number, client: Client) {

    }

    public removeClient(clientId: number) {

    }

    public addObject(objectId: number, syncObject: object) {

    }

    public removeObject(objectId: number) {

    }
}