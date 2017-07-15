
import {TileObject} from "./TileObject";
import * as p2js from "p2"
import {CollisionGroups} from "../CollisionGroups";

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

    /**
     * Goes trough all tiles in a layer, and creates a physics Body with a collider for each.
     * @param layerName
     */
    public createCollidersFromLayer(layerName: string): p2js.Body[] {
        let bodies: p2js.Body[] = [];

        let layer: Layer = null;
        for(let l of this.layers) {
            if(l.name == layerName) {
                layer = l;
                break;
            }
        }

        if(layer == null)
            return bodies;

        let tileLayer: TileLayer = <TileLayer>layer;

        let width = tileLayer.width;
        let height = tileLayer.height;
        let tw = this.tilewidth;
        let th = this.tileheight;
        let centerX = this.tilewidth/2;
        let centerY = this.tileheight/2;
        for(let y = 0; y < height; y++) {
            for(let x = 0; x < width; x++) {
                if(tileLayer.data[(y*width) + x] == 0)
                    continue;

                let body = new p2js.Body();
                body.mass = 0;
                body.type = p2js.Body.STATIC;
                body.damping = 0;
                body.position[0] = layer.x + (x * tw) + centerX;
                body.position[1] = layer.y + (y * th) + centerY;
                let shape = new p2js.Box({width: tw, height: th});
                shape.collisionGroup = CollisionGroups.TILE;
                shape.collisionMask = CollisionGroups.ENEMY | CollisionGroups.PLAYER;
                body.addShape(shape);

                bodies.push(body);
            }
        }

        return bodies;
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