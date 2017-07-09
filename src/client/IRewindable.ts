
export interface IRewindable {
    /**
     * Rewind the current state to that of the given tick.
     * If there is no valid state for that tick, then you might want to disable the body's colliders until there is.
     * This is only called when first rewinding, afterwards update is called normally,
     * with Game.isReplaying = true and Game.clientTick set to the current tick in replay.
     */
    rewind(tick: number);
}