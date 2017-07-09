
import {TickState} from "./TickState";


export class TickStates<T> {
    states: TickState<T>[];

    constructor() {
        this.clearStates();
    }

    public clearStates() {
        this.states = [];
    }

    public addState(state: TickState<T>) {
        if(this.states.length == 0 || state.tick >= this.states[this.states.length-1].tick) {
            this.states.push(state);
            return;
        } else {
            //Add state after the last state before our new one
            for(let i = this.size()-1; i >= 0; i--) {
                let current = this.states[i];
                if(current.tick <= state.tick) {
                    this.states.splice(i+1, 0, state);
                    return;
                }
            }
        }
    }

    public setState(state: TickState<T>) {
        let existingState = this.getStateAt(state.tick, true);
        if(existingState != null) {
            existingState.state = state.state;
            return;
        } else
            this.addState(state);
    }

    /**
     * Get the state which was current for the given tick
     */
    public getStateAt(tick: number, exact: boolean): TickState<T> {
        let currentState: TickState<T> = null;
        for(let state of this.states) {
            if(exact) {
                //Return first matching
                if(state.tick == tick)
                    return state;
                else if(state.tick > tick)
                    break;
            } else {
                //Return last matching
                if (state.tick <= tick)
                    currentState = state;
                else
                    break;
            }
        }

        return currentState;
    }

    public getStateAfter(tick: number): TickState<T> {
        for(let state of this.states) {
            if(state.tick > tick)
                return state;
        }
        return null;
    }

    public getState(state: number): TickState<T> {
        if(state >= this.size())
            return null;
        return this.states[state];
    }

    public size(): number {
        return this.states.length;
    }

    /**
     * Remove all states which were set before the given tick
     */
    public clearBefore(tick: number) {
        while(this.states.length > 0) {
            if(this.states[0].tick < tick)
                this.states.shift();
            else
                break;
        }
    }

    /**
     * Clear all states except the latest n states.
     */
    public clear(statesToKeep: number = 0) {
        if(statesToKeep == 0)
            this.states = [];
        else {
            while(this.states.length > statesToKeep) {
                this.states.shift();
            }
        }
    }
}