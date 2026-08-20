declare global {
    interface GlobalEventHandlersEventMap {
        ["#html"]: HtmlEventInterface;
    }
    interface ElementEventMap {
        ["#html"]: HtmlEventInterface;
    }
}
import type { DispatchParams, FetchParamsInterface, Atom } from "./type_flyweight.js";
interface HtmlRequestQueuedInterface extends FetchParamsInterface {
    status: "queued";
}
interface HtmlRequestRequestedInterface extends FetchParamsInterface {
    status: "requested";
}
interface HtmlRequestResolvedInterface extends FetchParamsInterface {
    status: "resolved";
    response: Response;
    html: string;
}
interface HtmlRequestRejectedInterface extends FetchParamsInterface {
    status: "rejected";
    error: any;
}
export type HtmlRequestState = HtmlRequestQueuedInterface | HtmlRequestRejectedInterface | HtmlRequestRequestedInterface | HtmlRequestResolvedInterface;
export interface HtmlEventInterface {
    readonly requestState: HtmlRequestState;
}
export declare class HtmlEvent extends Event implements HtmlEventInterface {
    #private;
    constructor(requestState: HtmlRequestState, eventInit?: EventInit);
    get requestState(): HtmlRequestState;
}
export declare function composeHtml(dispatchParams: DispatchParams): Atom | undefined;
export {};
