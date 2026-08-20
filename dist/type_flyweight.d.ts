export interface DispatchParams {
    kind: string;
    target: Element;
    event: Event;
    dispatchTarget: EventTarget;
    abortController?: AbortController;
    type: string;
    infix: string;
}
export interface Atom {
    queue(): void;
    exec(): Promise<void> | undefined;
}
export interface ComposerCallback {
    (params: DispatchParams): Atom | undefined;
}
export interface FetchParamsInterface {
    url: string;
    method: string;
}
export declare function createFetch(dispatchParams: DispatchParams): Request | undefined;
