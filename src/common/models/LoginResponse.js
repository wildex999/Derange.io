"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var LoginResponse = (function () {
    function LoginResponse() {
    }
    LoginResponse.prototype.getEventId = function () {
        return LoginResponse.eventId;
    };
    return LoginResponse;
}());
LoginResponse.eventId = "loginResponse";
exports.LoginResponse = LoginResponse;
var LoginResponseCode;
(function (LoginResponseCode) {
    LoginResponseCode[LoginResponseCode["Ok"] = 0] = "Ok";
    LoginResponseCode[LoginResponseCode["Invalid"] = 1] = "Invalid";
    LoginResponseCode[LoginResponseCode["Error"] = 2] = "Error"; //Something else went wrong.
})(LoginResponseCode = exports.LoginResponseCode || (exports.LoginResponseCode = {}));
