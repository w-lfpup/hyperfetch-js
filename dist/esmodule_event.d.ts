declare global {
    interface GlobalEventHandlersEventMap {
        ["#esmodule"]: EsModuleEventInterface;
    }
    interface ElementEventMap {
        ["#esmodule"]: EsModuleEventInterface;
    }
}
import type { DispatchParams, Atom } from "./type_flyweight.js";
interface EsModuleQueuedInterface {
    status: "queued";
    url: string;
}
interface EsModuleRequestedInterface {
    status: "requested";
    url: string;
}
interface EsModuleResolvedInterface {
    status: "resolved";
    url: string;
}
interface EsModuleErrorInterface {
    status: "rejected";
    url: string;
    error: any;
}
export type EsModuleRequestState = EsModuleQueuedInterface | EsModuleRequestedInterface | EsModuleResolvedInterface | EsModuleErrorInterface;
export interface EsModuleEventInterface {
    requestState: EsModuleRequestState;
}
export declare class EsModuleEvent extends Event implements EsModuleEventInterface {
    requestState: EsModuleRequestState;
    constructor(requestState: EsModuleRequestState, eventInitDict?: EventInit);
}
export declare function composeEsModule(dispatchParams: DispatchParams): Atom | undefined;
export {};
