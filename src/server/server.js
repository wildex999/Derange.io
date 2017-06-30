"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var io = require("socket.io");
var client_1 = require("./client");
var protocol_1 = require("../common/models/protocol");
var Server = (function () {
    function Server() {
        var _this = this;
        this.clients = {};
        //Start the server
        var httpServer = http.createServer();
        httpServer.listen(8765);
        var ioServer = io(httpServer);
        ioServer.on('connection', function (socket) { return _this.onConnection(socket); });
        console.log("Started server");
    }
    Server.prototype.onConnection = function (socket) {
        var _this = this;
        //Create client
        var client = new client_1.Client(socket);
        this.clients[socket.id] = client;
        //Setup handlers
        socket.on('disconnect', function (socket) { return _this.onDisconnect(socket); });
        //Send the protocol version
        socket.emit(protocol_1.Protocol.eventId, Server.protocolVersion);
    };
    Server.prototype.onDisconnect = function (socket) {
        //TODO: Allow Client to cleanup
        //TODO: Allow Client to cleanup
        //TODO: Allow Client to cleanup
        //TODO: Allow Client to cleanup
        //TODO: Allow Client to cleanup
        delete this.clients[socket.id];
    };
    return Server;
}());
Server.protocolVersion = 1;
exports.Server = Server;
