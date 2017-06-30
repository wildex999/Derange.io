/**
 * Message sent by the player when joining a world.
 * The server will then add the client as a player to the world,
 * and sync the current world state.
 */
export class JoinWorld implements Model {
    public static eventId = "joinworld";

    //TODO: Include information on which world to join

    getEventId(): string {
        return JoinWorld.eventId;
    }
}