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
var StateGame = (function (_super) {
    __extends(StateGame, _super);
    function StateGame() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StateGame.prototype.create = function () {
    };
    StateGame.prototype.update = function () {
    };
    return StateGame;
}(Phaser.State));
StateGame.stateKey = "Game";
exports.StateGame = StateGame;
