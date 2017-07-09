
export class TickState<T> {
    public tick: number;
    public state: T;

    constructor(tick: number, state: T) {
        this.tick = tick;
        this.state = state;
    }
}