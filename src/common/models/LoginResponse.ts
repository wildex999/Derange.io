///<reference path="model.ts"/>

export class LoginResponse implements Model {
    public static eventId = "loginResponse";

    public clientId: string;
    public code: LoginResponseCode;
    public error: string; //Empty if Code != Error

    constructor(code?: LoginResponseCode, error?: string, clientId?: string) {
        this.code = code;
        this.error = error;
        this.clientId = clientId;
    }

    getEventId(): string {
        return LoginResponse.eventId;
    }
}

export enum LoginResponseCode {
    Ok, //Login ok
    Invalid, //Login invalid(Username or password incorrect)
    Error //Something else went wrong.
}