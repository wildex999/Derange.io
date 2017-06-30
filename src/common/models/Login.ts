export class Login implements Model {
    public static eventId = "login";

    username: string;

    constructor(username?: string) {
        if(username)
            this.username = username;
    }

    getEventId(): string {
        return Login.eventId;
    }
}