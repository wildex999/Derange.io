/**
 * Maintain the syncing of a given object between server and clients.
 * You either register yourself as a server or as a client, which decides the sync direction.
 *
 * Register variables to be synced, and this will setup setters for them.(@Sync)
 * When a setter is called with a new type, the change is synced to the clients on the next network update.
 * Grouping of variables can be done by putting them into a class. For example: x,y,z into a Position class.
 *
 * It is possible to setup a callback for when a change is being synced for a given variable.
 */

export abstract class ObjectSyncer {
    //TODO: Use this class for shared content between ClientSyncer and ServerSyncer
}