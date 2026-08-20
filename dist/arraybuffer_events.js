import { createFetch } from "./type_flyweight.js";
export class ArrayBufferEvent extends Event {
    #requestState;
    constructor(requestState, eventInit) {
        super("#html", eventInit);
        this.#requestState = requestState;
    }
    get requestState() {
        return this.#requestState;
    }
}
class ArrayBufferFetch {
    #dispatchParams;
    #request;
    constructor(dispatchParams, request) {
        this.#dispatchParams = dispatchParams;
        this.#request = request;
    }
    queue() {
        let { dispatchTarget } = this.#dispatchParams;
        let { url, method } = this.#request;
        let event = new ArrayBufferEvent({ status: "queued", url, method });
        dispatchTarget.dispatchEvent(event);
    }
    exec() {
        return fetchArrayBuffer(this.#dispatchParams, this.#request);
    }
}
export function composeArrayBuffer(dispatchParams) {
    let ArrayBufferRequest = createFetch(dispatchParams);
    if (ArrayBufferRequest) {
        return new ArrayBufferFetch(dispatchParams, ArrayBufferRequest);
    }
}
function fetchArrayBuffer(dispatchParams, request) {
    if (dispatchParams.abortController?.signal.aborted)
        return;
    let { dispatchTarget } = dispatchParams;
    let { url, method } = request;
    let event = new ArrayBufferEvent({ status: "requested", url, method });
    dispatchTarget.dispatchEvent(event);
    return fetch(request)
        .then(resolveResponseBody)
        .then(function ([response, arrayBuffer]) {
        let event = new ArrayBufferEvent({
            status: "resolved",
            response,
            arrayBuffer,
            url,
            method,
        });
        dispatchTarget.dispatchEvent(event);
    })
        .catch(function (error) {
        let event = new ArrayBufferEvent({
            status: "rejected",
            error,
            url,
            method,
        });
        dispatchTarget.dispatchEvent(event);
    });
}
function resolveResponseBody(response) {
    return Promise.all([response, response.arrayBuffer()]);
}
