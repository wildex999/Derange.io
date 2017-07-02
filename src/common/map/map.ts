
import {TileObject} from "./TileObject";

export class Map {
    width: number;
    height: number;

    layers: Layer[];
    tilesets: Tileset[];
    tilewidth: number;
    tileheight: number;

    /**
     * Copy content of the given JSON object into this map
     * @param jsonObject JSON object from Tiled map json
     */
    public fromJson(jsonObject: any) {
        for(let attrname in jsonObject) {
            this[attrname] = jsonObject[attrname];
        }
    }

    /**
     * Go through the object layers to find a spawn, and return the object.
     * Returns null if none is found.
     */
    public findSpawn(): TileObject {
        if(this.layers == null)
            return null;

        for(let tileLayer of this.layers) {
            if(tileLayer.type != "objectgroup")
                continue;

            let objectLayer: ObjectLayer = <ObjectLayer>tileLayer;
            if(objectLayer.objects == null)
                continue;

            for(let obj of objectLayer.objects) {
                if(obj.type == "spawn")
                    return obj;
            }
        }
    }
}

class Tileset {
    columns: number;
    firstgid: number;
    imageheight: number;
    imagewidth: number;
    name: string;
    margin: number;
    spacing: number;
    tilecount: number;
    tileheight: number;
    tilewidth: number;
    image: string;
}

class Layer {
    type: string;
    name: string;
    visible: boolean;
    x: number;
    y: number;
}

class TileLayer extends Layer {
    data: number[];
    width: number;
    height: number;
}

class ObjectLayer extends Layer {
    objects: TileObject[];
}