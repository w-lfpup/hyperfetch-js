declare global {
    interface GlobalEventHandlersEventMap {
        ["#arraybuffer"]: ArrayBufferEventInterface;
    }
    interface ElementEventMap {
        ["#arraybuffer"]: ArrayBufferEventInterface;
    }
}
import type { DispatchParams, FetchParamsInterface, Atom } from "./type_flyweight.js";
interface ArrayBufferRequestQueuedInterface extends FetchParamsInterface {
    status: "queued";
}
interface ArrayBufferRequestRequestedInterface extends FetchParamsInterface {
    status: "requested";
}
interface ArrayBufferRequestResolvedInterface extends FetchParamsInterface {
    status: "resolved";
    response: Response;
    arrayBuffer: ArrayBuffer;
}
interface ArrayBufferRequestRejectedInterface extends FetchParamsInterface {
    status: "rejected";
    error: any;
}
export type ArrayBufferRequestState = ArrayBufferRequestQueuedInterface | ArrayBufferRequestRejectedInterface | ArrayBufferRequestRequestedInterface | ArrayBufferRequestResolvedInterface;
export interface ArrayBufferEventInterface {
    readonly requestState: ArrayBufferRequestState;
}
export declare class ArrayBufferEvent extends Event implements ArrayBufferEventInterface {
    #private;
    constructor(requestState: ArrayBufferRequestState, eventInit?: EventInit);
    get requestState(): ArrayBufferRequestState;
}
export declare function composeArrayBuffer(dispatchParams: DispatchParams): Atom | undefined;
export {};
