/**
 * Place as decorator on a property to mark it as synced.
 *
 */
import {ISyncedObject} from "./ISyncedObject";
import "reflect-metadata";

export function Sync(propertyId?: string) {
    return (targetIn: any, key: string) => {
        //Stop the IDE from complaining about targetIn not being an ISyncedObject, as it isn't at compile time.
        let target: ISyncedObject = targetIn;
        let type = Reflect.getMetadata("design:type", targetIn, key);
        if(!propertyId)
            propertyId = key;

        console.log("Prot: " + propertyId + " | " + JSON.stringify(targetIn));

        let getter = function () {
            //console.log("Get: " + key + " = " + _val);
            return this["_" + key];
        };

        let setter = function (value) {
            let current = this["_" + key];
            if (current == value)
                return;

            //console.log("Set: " + key + " = " + value + " | " + this);
            this["_" + key] = value;

            //Mark as changed in the class instance
            markAsChanged(this);

            //If target is a SyncedObject, listen for changes and propagate
            //console.log("Do? " + value + " | " + (<ISyncedObject>value).syncObjectId);
            if (value != null && (<ISyncedObject>value).syncObjectId) {
                //console.log("SetHandlerSync");
                (<ISyncedObject>value).syncHandler = (syncObj) => {
                    markAsChanged(this);
                }

            }
        };

        let markAsChanged = function (syncObject: ISyncedObject) {
            //console.log("Mark as changed: " + key + " in " + JSON.stringify(syncObject) + " | " + syncObject.syncObjectId);
            syncObject.markChanged(propertyId);
        };

        let encode;
        let decode;

        //Different encode/decode if the target is a SyncedObject
        if (type.syncObjectId == null) {
            //Normal property
            encode = function (delta: boolean, resetChanged: boolean): string {
                //console.log("Encode: " + key + " => " + JSON.stringify(this["_" + key]));
                return JSON.stringify(this["_" + key]);
            };

            decode = function (value: string): any {
                //console.log("Decode: " + value + " => " + JSON.parse(value));
                this["_" + key] = JSON.parse(value);
            };
        } else {
            //SyncedObject
            encode = function (delta: boolean, resetChanged: boolean): string {
                if (this["_" + key] == null)
                    return null;

                return (<ISyncedObject>this["_" + key]).syncEncode(delta, resetChanged);
            };

            decode = function (value: string): any {
                let isNew = false;
                let obj: ISyncedObject = this["_" + key];
                if(obj == null) {
                    //Create new instance of type
                    if(type == null)
                        throw new Error("Syncing new property '" + key + "' with unknown type.");

                    obj = new type();
                    this["_" + key] = obj;
                    isNew = true;
                }

                obj.syncDecode(value);

                if(isNew)
                    obj.syncCreated();
                else
                    obj.syncUpdated();
            }
        }

        //Setup properties. We will copy existing from the property chain, but redefine our own.
        //We don't want to add our own sync properties to the parent.
        if (!target.hasOwnProperty("sync")) {
            let existingSync = {};
            for(let syncProp in target.sync) //Copy existing sync from prototype chain
                existingSync[syncProp] = target.sync[syncProp];

            Object.defineProperty(target, "sync", {
                value: existingSync
            });
        }
        target.sync[propertyId] = {};

        Object.defineProperty(target, "syncEncode_" + propertyId, {
            value: encode
        });
        Object.defineProperty(target, "syncDecode_" + propertyId, {
            value: decode
        });

        //Delete the original property so we can replace with a getter/setter
        delete target[key];

        Object.defineProperty(target, key, {
            get: getter,
            set: setter,
            enumerable: true,
            configurable: true
        });
    }
}