import { createFetch } from "./type_flyweight.js";
export class JsonEvent extends Event {
    #requestState;
    constructor(requestState, eventInitDict) {
        super("#json", eventInitDict);
        this.#requestState = requestState;
    }
    get requestState() {
        return this.#requestState;
    }
}
class JsonFetch {
    #dispatchParams;
    #request;
    constructor(dispatchParams, request) {
        this.#dispatchParams = dispatchParams;
        this.#request = request;
    }
    queue() {
        let { target } = this.#dispatchParams;
        let { url, method } = this.#request;
        let event = new JsonEvent({ status: "queued", url, method });
        target.dispatchEvent(event);
    }
    exec() {
        return fetchJson(this.#dispatchParams, this.#request);
    }
}
export function composeJson(dispatchParams) {
    let request = createFetch(dispatchParams);
    if (!request)
        return;
    return new JsonFetch(dispatchParams, request);
}
function fetchJson(dispatchParams, request) {
    if (dispatchParams.abortController?.signal.aborted)
        return;
    let { dispatchTarget } = dispatchParams;
    let { url, method } = request;
    let event = new JsonEvent({ status: "requested", url, method });
    dispatchTarget.dispatchEvent(event);
    return fetch(request)
        .then(resolveResponseBody)
        .then(function ([response, json]) {
        let event = new JsonEvent({
            status: "resolved",
            response,
            json,
            url,
            method,
        });
        dispatchTarget.dispatchEvent(event);
    })
        .catch(function (error) {
        let event = new JsonEvent({
            status: "rejected",
            error,
            url,
            method,
        });
        dispatchTarget.dispatchEvent(event);
    });
}
function resolveResponseBody(response) {
    return Promise.all([response, response.text()]);
}
