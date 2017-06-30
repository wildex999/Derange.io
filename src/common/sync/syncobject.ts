/**
 * Place as decorator on properties to sync which are an object.
 * The object type to sync must have a @SyncedObject placed on it.
 * They are essentially groups of synced properties.
 */
export function SyncObject(target: any, key: string) {
    //TODO: Same as Sync, but should call the target's Encode/Decode method
    let _val = target[key];

    let getter = function() {
        //console.log("Get: " + key + " = " + _val);
        return _val;
    };

    let setter = function(value) {
        //console.log("Set: " + key + " = " + value + " | " + this);
        _val = value;

        //Mark as changed in the class instance
        this.syncHasChanged = true;
        this.syncChanged[key] = true;
    };

    let encode = function(): string {
        //console.log("Encode: " + _val + " => " + JSON.stringify(_val));
        return JSON.stringify(_val);
    };

    let decode = function(value: string): any {
        //console.log("Decode: " + value + " => " + JSON.parse(value));
        return JSON.parse(value);
    };

    if(!target.sync)
        target.sync = {}; //List of all synced properties
    target.sync[key] = null;
    target["syncEncode_" + key] = encode;
    target["syncDecode_" + key] = decode;

    //Delete the original property so we can replace with a getter/setter
    delete target[key];

    Object.defineProperty(target, key, {
        get: getter,
        set: setter,
        enumerable: true,
        configurable: true
    });
}