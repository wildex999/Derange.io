/**
 * Decorator to place on any class which contains @Sync-ed properties.
 * This will take care of encoding the synced object as a whole, and notify any watchers that the object has updated.
 */
import {ISyncedObject} from "./ISyncedObject";

export function SyncedObject(objectId?: string, onCreated?: string, onUpdate?: string, onDestroy?: string) {
    return (targetIn: any) => {
        let target: ISyncedObject = targetIn;
        let prot: ISyncedObject = targetIn.prototype;
        if(!objectId)
            objectId = targetIn.name;

        /**
         * When the object is marked as "changed", we call the handler.
         * @param value
         */
        let setter = function (value: boolean) {
            //console.log("ObjHasChanged: " + objectId + ": " + value + "(" + this._syncHasChanged + ")" + " has " + this.syncHandler);
            if (value == this._syncHasChanged)
                return;

            this._syncHasChanged = value;
            if (value && this.syncHandler) {
                //console.log("Wut: " + this.syncInstanceId + " | " + target.syncInstanceId + " | " + prot.syncInstanceId);
                this.syncHandler(this);
            }
        };

        let getter = function (): boolean {
            return this._syncHasChanged;
        };

        /**
         * Call encode on all synced variables, and add them to a map, which is then turned into a JSON string.
         * @param delta Whether or not to only include the changes since the last call to encode
         */
        let encode = function (delta: boolean, resetChanged: boolean): string {
            if (delta && (!this.syncHasChanged || !this.syncChanged))
                return "{}";

            let syncedVars = {};
            let syncList;
            if(delta)
                syncList = this.syncChanged;
            else
                syncList = this.sync;
            //console.log("EncodeDelta: " + objectId + " | " + delta + " | " + JSON.stringify(syncList));

            for (let syncVar in syncList) {
                let val = this["syncEncode_" + syncVar](delta, resetChanged);
                if(val == undefined) //Even undefined must be synced
                    val = null;
                syncedVars[syncVar] = val;
            }

            //Reset sync check
            if(resetChanged) {
                this.syncHasChanged = false;
                this.syncChanged = {};
            }

            //console.log("SyncObject encode: " + this.syncInstanceId + " | " + syncedVars + " => " + JSON.stringify(syncedVars));
            return JSON.stringify(syncedVars);
        };

        /**
         * Takes in a JSON string, decodes the values, and applies them to the variable.
         * @param jsonString String of JSON object containing map of synced variables
         */
        let decode = function (jsonString: string) {
            let syncedVars = JSON.parse(jsonString);
            //console.log("SyncObject decode: " + jsonString + " => " + JSON.stringify(syncedVars) + " in " + JSON.stringify(this));

            for (let syncVar in syncedVars) {
                if(!this["syncDecode_" + syncVar])
                    throw new Error("Trying to decode '" + syncVar + "', but this property does not exist on the object defined for " + this.syncObjectId);
                //console.log("Decode: " + syncVar);
                this["syncDecode_" + syncVar](syncedVars[syncVar]);
            }
        };

        /**
         * Called when a new instance of the SyncedObject has been created as a result of a SyncCreate event.
         */
        let created = function() {
            //console.log("Create: " + onCreated + " | " + this.onCreated);
            if(!onCreated)
                return;
            
            this[onCreated]();
        };

        /**
         * Called when the instance has been updated by a SyncUpdate event.
         */
        let update = function() {
            if(!onUpdate)
                return;

            this[onUpdate]();
        };

        let destroy = function() {
            //Call destroy on all children
            for (let syncVar in this.sync) {
                if(this["_" + syncVar] != null && this["_" + syncVar].syncDestroy)
                    this["_" + syncVar].syncDestroy();
            }

            if(!onDestroy)
                return;

            this[onDestroy]();
        };

        let markChanged = function(propertyId: string) {
            this.syncChanged[propertyId] = true;
            this.syncHasChanged = true;
        };

        prot.syncHandler = null;
        prot.syncChanged = {}; //List of all changed properties since last sync

        prot.syncEncode = encode;
        prot.syncDecode = decode;

        if(onCreated != null || prot.syncCreated == null)
            prot.syncCreated = created;
        if(onUpdate != null || prot.syncUpdated == null)
            prot.syncUpdated = update;
        if(onDestroy != null || prot.syncDestroy == null)
            prot.syncDestroy = destroy;

        prot.markChanged = markChanged;

        //We want the objectId available both on instances and on the object
        target.syncObjectId = objectId;
        prot.syncObjectId = objectId;


        (<any>target)._syncHasChanged = false;

        prot.syncInstanceId = null;
        if(!target.sync)
            target.sync = {};

        Object.defineProperty(prot, "syncHasChanged", {
            set: setter,
            get: getter,
            enumerable: true,
            configurable: true
        });

        return <any>target;
    }
}