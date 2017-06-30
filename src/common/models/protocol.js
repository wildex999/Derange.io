"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Protocol = (function () {
    function Protocol() {
    }
    Protocol.prototype.getEventId = function () {
        return Protocol.eventId;
    };
    return Protocol;
}());
Protocol.eventId = "protocolVersion";
exports.Protocol = Protocol;
