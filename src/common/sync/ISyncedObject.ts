/**
 * Describes an object with the @SyncedObject decorator.
 */

export interface ISyncedObject {
    sync: {[key: string]: any}; //Map of all Properties to sync
    syncChanged: {[key: string]: boolean}; //List of all synced properties which have changed since last sync.
    syncObjectId: string; //Object id of the class
    syncInstanceId: string; //Unique ID for this object instance.
    syncHasChanged: boolean; //Whether or not this SyncedObject has any changes to sync.
    syncHandler: (objInstance: ISyncedObject) => void; //Set handler to call when syncHasChanged is set to true.

    syncEncode(delta: boolean); //Encode
    syncDecode(jsonString: string);

    //Event handlers
    syncCreated(); //Added due to a SyncCreate
    syncUpdated(); //Updated due to a SyncUpdate
    syncDestroy(); //Destroyed due to a SyncDestroy
}