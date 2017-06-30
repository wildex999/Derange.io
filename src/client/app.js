"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
//Global imports
require("p2");
require("pixi");
require("phaser-ce");
require("socket.io-client");
var stategame_1 = require("./stategame");
var stateconnect_1 = require("./stateconnect");
/*
// -------------------------------------------------------------------------
// -------------------------------------------------------------------------
// -------------------------------------------------------------------------
class Game extends Phaser.Game {
    // -------------------------------------------------------------------------
    constructor() {
        // init game
        super(640, 400, Phaser.AUTO, "content", State);
    }
}

// -------------------------------------------------------------------------
// -------------------------------------------------------------------------
// -------------------------------------------------------------------------
class State extends Phaser.State {
    private static CANNON_SPEED = 2;
    private static MISSILE_SPEED = 6;

    private _cannon: Phaser.Sprite;
    private _cannoTip: Phaser.Point = new Phaser.Point();

    private _drones: Phaser.Group;
    private _dronesCollisionGroup: Phaser.Physics.P2.CollisionGroup;
    private _missiles: Phaser.Group;
    private _missilesCollisionGroup: Phaser.Physics.P2.CollisionGroup;

    private _space: Phaser.Key;

    preload() {
        //Background image
        this.game.load.image("BG", "bg.jpg");
        //Sprite images in atlas
        this.game.load.atlas("Atlas", "atlas.png", "atlas.json");
    }

    create() {
        //Background
        this.add.image(0, 0, "BG");

        //Set the Physics system
        this.game.physics.startSystem(Phaser.Physics.P2JS);

        //Cannon - Place it at the bottom center
        this._cannon = this.game.add.sprite(this.world.centerX, this.world.height, "Atlas", "cannon");
        //Offset it by setting the anchor
        this._cannon.anchor.setTo(-0.75, 0.5);
        //Make it point up
        this._cannon.rotation = -Math.PI / 2;

        //Cannon base - Place over cannon, so it overlaps
        var base = this.game.add.sprite(this.world.centerX, this.world.height, "Atlas", "base");
        base.anchor.setTo(0.5, 1);
            
        //Game input
        this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this._space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        //Stop keys from being sent to browser(Moves the window)
        this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.SPACEBAR]);

        //--Drones

        //Allow impact events
        this.game.physics.p2.setImpactEvents(true);

        //Collision groups for drones
        this._dronesCollisionGroup = this.game.physics.p2.createCollisionGroup();
        //Collision groups for missiles
        this._missilesCollisionGroup = this.game.physics.p2.createCollisionGroup();

        //Drones group
        this._drones = this.add.group();
        this._drones.physicsBodyType = Phaser.Physics.P2JS;
        this._drones.enableBody = true;

        //Create 8 drones
        this._drones.classType = Dron;
        this._drones.createMultiple(8, "Atlas", "dron1");
        this._drones.forEach(function (aDron: Dron) {
            var state: State = this;

            //Setup movement and animation
            aDron.setUp();
            //Setup Physics
            var body: Phaser.Physics.P2.Body = aDron.body;
            body.setCircle(aDron.width / 2);
            body.kinematic = true; //Does not respond to forces
            body.setCollisionGroup(state._dronesCollisionGroup);
            //Add group drones will collide with and callback
            body.collides(state._missilesCollisionGroup, state.hitDron, this);
            //body.debug = true;
        }, this);


        //--Missiles

        //Missiles group
        this._missiles = this.add.group();
        this._missiles.physicsBodyType = Phaser.Physics.P2JS;
        this._missiles.enableBody = true;

        //Create 10 missiles
        this._missiles.createMultiple(10, "Atlas", "missile");
        this._missiles.forEach(function (aMissile: Phaser.Sprite) {
            var state: State = this;

            aMissile.anchor.setTo(0.5, 0.5);
            //Physics
            var body: Phaser.Physics.P2.Body = aMissile.body;
            body.setRectangle(aMissile.width, aMissile.height);
            body.setCollisionGroup(state._missilesCollisionGroup);
            body.collides(state._dronesCollisionGroup);
            //body.debug = true;
        }, this);
    }

    private hitDron(aObject1: any, aObject2: any) {
        //Explode dron and remove missile - kill it, not destroy
        (<Dron>aObject1.sprite).explode();
        (<Phaser.Sprite>aObject2.sprite).kill();
    }

    update() {
        var keyboard: Phaser.Keyboard = this.game.input.keyboard;

        //Left and Right keys
        if (keyboard.isDown(Phaser.Keyboard.LEFT)) {
            //Calculate frame independent speed
            this._cannon.rotation -= this.time.elapsedMS * State.CANNON_SPEED / 1000 * (Math.PI / 4);
        } else if (keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            this._cannon.rotation += this.time.elapsedMS * State.CANNON_SPEED / 1000 * (Math.PI / 4);
        } else if (this._space.justDown) {//Fire missile
            //Get first missile from pool
            var missile: Phaser.Sprite = this._missiles.getFirstExists(false);
            if (missile) {
                //Calculate position of cannon tip
                this._cannoTip.setTo(this._cannon.width * 2, 0);
                this._cannoTip.rotate(0, 0, this._cannon.rotation);

                missile.reset(this._cannon.x + this._cannoTip.x, this._cannon.y + this._cannoTip.y);
                (<Phaser.Physics.P2.Body>missile.body).rotation = this._cannon.rotation;
                //Life of missile in millis
                missile.lifespan = 1500;
                //Set velocity of missile in the direction of cannon barrel
                (<Phaser.Physics.P2.Body>missile.body).velocity.x = this._cannoTip.x * State.MISSILE_SPEED;
                (<Phaser.Physics.P2.Body>missile.body).velocity.y = this._cannoTip.y * State.MISSILE_SPEED;
            }
        }

        //Limit cannon rotation to +/- 45 degree
        this._cannon.rotation = Phaser.Math.clamp(this._cannon.rotation, -1.5 * Math.PI / 2, -0.5 * Math.PI / 2);
    }
}

class Dron extends Phaser.Sprite {
    public setUp() {
        this.anchor.setTo(0.5, 0.5);

        //Random position
        this.reset(this.game.rnd.between(40, 600), this.game.rnd.between(60, 150));

        //Random movement range
        var range: number = this.game.rnd.between(60, 120);
        //Random duration
        var duration: number = this.game.rnd.between(30000, 50000);
        //Random parameters for wiggle
        var xPeriod1: number = this.game.rnd.between(2, 13);
        var xPeriod2: number = this.game.rnd.between(2, 13);
        var yPeriod1: number = this.game.rnd.between(2, 13);
        var yPeriod2: number = this.game.rnd.between(2, 13);

        //Set tweens for horizontal and vertical movement
        var xTween = this.game.add.tween(this.body);
        xTween.to({ x: this.position.x + range }, duration, function (aProgress: number) {
            return wiggle(aProgress, xPeriod1, xPeriod2);
        }, true, 0, -1);

        var yTween = this.game.add.tween(this.body);
        yTween.to({ y: this.position.y + range }, duration, function (aProgress: number) {
            return wiggle(aProgress, yPeriod1, yPeriod2);
        }, true, 0, -1);

        //Define animations
        this.animations.add("anim", ["dron1", "dron2"], this.game.rnd.between(2, 5), true);
        this.animations.add("explosion", Phaser.Animation.generateFrameNames("Explosion", 1, 6, "", 3));

        //Play the first animation as default
        this.play("anim");
    }

    public explode() {
        //Remove movement tweens
        this.game.tweens.removeFrom(this.body);
        //Explode Dron and kill it on complete
        this.play("explosion", 8, false, true);
    }
}

function wiggle(aProgress: number, aPeriod1: number, aPeriod2: number): number {
    var current1: number = aProgress * Math.PI * 2 * aPeriod1;
    var current2: number = aProgress * Math.PI * 2 * aPeriod2;

    return Math.sin(current1) * Math.cos(current2);
}*/
// -------------------------------------------------------------------------
// -------------------------------------------------------------------------
// -------------------------------------------------------------------------
var Game = (function (_super) {
    __extends(Game, _super);
    function Game() {
        var _this = _super.call(this, 640, 400, Phaser.AUTO, "content") || this;
        _this.state.add(stateconnect_1.StateConnect.stateKey, stateconnect_1.StateConnect);
        _this.state.add(stategame_1.StateGame.stateKey, stategame_1.StateGame);
        _this.state.start(stateconnect_1.StateConnect.stateKey);
        return _this;
    }
    return Game;
}(Phaser.Game));
new Game();
