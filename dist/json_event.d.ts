declare global {
    interface GlobalEventHandlersEventMap {
        ["#json"]: JsonEventInterface;
    }
    interface ElementEventMap {
        ["#json"]: JsonEventInterface;
    }
}
import type { DispatchParams, FetchParamsInterface, Atom } from "./type_flyweight.js";
interface JsonRequestQueuedInterface extends FetchParamsInterface {
    status: "queued";
}
interface JsonRequestRequestedInterface extends FetchParamsInterface {
    status: "requested";
}
interface JsonRequestResolvedInterface extends FetchParamsInterface {
    status: "resolved";
    response: Response;
    json: any;
}
interface JsonRequestRejectedInterface extends FetchParamsInterface {
    status: "rejected";
    error: any;
}
export type JsonRequestState = JsonRequestQueuedInterface | JsonRequestRequestedInterface | JsonRequestResolvedInterface | JsonRequestRejectedInterface;
export interface JsonEventInterface {
    readonly requestState: JsonRequestState;
}
export declare class JsonEvent extends Event implements JsonEventInterface {
    #private;
    constructor(requestState: JsonRequestState, eventInitDict?: EventInit);
    get requestState(): JsonRequestState;
}
export declare function composeJson(dispatchParams: DispatchParams): Atom | undefined;
export {};
