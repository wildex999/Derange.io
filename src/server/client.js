"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Login_1 = require("../common/models/Login");
var LoginResponse_1 = require("../common/models/LoginResponse");
var Client = (function () {
    function Client(socket) {
        var _this = this;
        this.socket = socket;
        //Setup listeners
        socket.on(Login_1.Login.eventId, function (login) { return _this.onLogin(login); });
    }
    Client.prototype.onLogin = function (login) {
        //TODO: Check the login information
        this.username = login.username;
        //Send back response
        var response = new LoginResponse_1.LoginResponse();
        response.code = LoginResponse_1.LoginResponseCode.Ok;
        this.socket.emit(response.getEventId(), response);
    };
    return Client;
}());
exports.Client = Client;
