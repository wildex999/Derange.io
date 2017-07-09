import Game = Phaser.Game;

/**
 * List of all assets
 */
export abstract class Asset {
    public key: string;
    public path: string;

    constructor(key: string, path: string) {
        this.key = key;
        this.path = path;
    }

    public abstract load();
}

export class ImageAsset extends Asset {
    public load() {
        Assets.game.load.image(this.key, this.path);
    }
}

export class Assets {
    public static game: Game;
    public static assetsDir = "assets/";

    /** Sprites **/
    public static spritesDir = Assets.assetsDir + "sprites/";
    public static player = new ImageAsset("player", Assets.spritesDir + "player.png");
    public static enemy = new ImageAsset("enemy", Assets.spritesDir + "enemy.png");

    public static attackSlash = new ImageAsset("attackSlash", Assets.spritesDir + "attackSlash.png");

    /** TileSets **/
    public static tileSetsDir = Assets.assetsDir + "tiles/";
    public static tileSet = new ImageAsset("tileset", Assets.tileSetsDir + "dungeon_tiles.png");
}