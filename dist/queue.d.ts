import type { DispatchParams, Atom } from "./type_flyweight.js";
export declare class Queue {
    #private;
    enqueue(atom: Atom): void;
}
export declare function queued(dispatchParams: DispatchParams, atom: Atom): boolean;
