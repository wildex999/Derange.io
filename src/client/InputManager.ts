
import {Game} from "./Game";
import {Keys} from "./Keys";

export class InputManager {
    game: Game;

    keys: {[key: number]: Phaser.Key};

    constructor(game: Game) {
        this.game = game;
        this.keys = {};

        this.map(Keys.Up, Phaser.Keyboard.W);
        this.map(Keys.Down, Phaser.Keyboard.S);
        this.map(Keys.Left, Phaser.Keyboard.A);
        this.map(Keys.Right, Phaser.Keyboard.D);
    }

    public map(key: Keys, code: number) {
        if(this.keys[key]) {
            let keyCode = this.keys[key].keyCode;
            this.game.input.keyboard.removeKeyCapture(keyCode);
            this.game.input.keyboard.removeKey(keyCode);
        }

        if(code == null) {
            delete this.keys[key];
            return;
        }

        this.keys[key] = this.game.input.keyboard.addKey(code);
        this.game.input.keyboard.addKeyCapture(code);
    }

    public isDown(key: Keys): boolean {
        let input = this.keys[key];
        if(input == null)
            return false;

        return input.isDown;
    }
}

class MappedKey {
    public name: string;
    public key: Phaser.Key;

    constructor(name: string) {
        this.name = name;
    }
}