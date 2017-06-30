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
var protocol_1 = require("../common/models/protocol");
/**
    * Connecting to the server, logging in and joining a world.
    */
var StateConnect = (function (_super) {
    __extends(StateConnect, _super);
    function StateConnect() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StateConnect.prototype.create = function () {
        var _this = this;
        var socket = io('http://localhost:8765');
        socket.on(protocol_1.Protocol.eventId, function (data) { return _this.onProtocol(data); });
    };
    StateConnect.prototype.update = function () {
    };
    StateConnect.prototype.onProtocol = function (protocol) {
    };
    StateConnect.prototype.onLogin = function (response) {
    };
    return StateConnect;
}(Phaser.State));
StateConnect.stateKey = "Connect";
exports.StateConnect = StateConnect;
