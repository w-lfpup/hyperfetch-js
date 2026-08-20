import { createFetch } from "./type_flyweight.js";
export class HtmlEvent extends Event {
    #requestState;
    constructor(requestState, eventInit) {
        super("#html", eventInit);
        this.#requestState = requestState;
    }
    get requestState() {
        return this.#requestState;
    }
}
class HtmlFetch {
    #dispatchParams;
    #request;
    constructor(dispatchParams, request) {
        this.#dispatchParams = dispatchParams;
        this.#request = request;
    }
    queue() {
        let { dispatchTarget } = this.#dispatchParams;
        let { url, method } = this.#request;
        let event = new HtmlEvent({ status: "queued", url, method });
        dispatchTarget.dispatchEvent(event);
    }
    exec() {
        return fetchHtml(this.#dispatchParams, this.#request);
    }
}
export function composeHtml(dispatchParams) {
    let htmlRequest = createFetch(dispatchParams);
    if (!htmlRequest)
        return;
    return new HtmlFetch(dispatchParams, htmlRequest);
}
function fetchHtml(dispatchParams, request) {
    if (dispatchParams.abortController?.signal.aborted)
        return;
    let { dispatchTarget } = dispatchParams;
    let { url, method } = request;
    let event = new HtmlEvent({ status: "requested", url, method });
    dispatchTarget.dispatchEvent(event);
    return fetch(request)
        .then(resolveResponseBody)
        .then(function ([response, html]) {
        let event = new HtmlEvent({
            status: "resolved",
            response,
            html,
            url,
            method,
        });
        dispatchTarget.dispatchEvent(event);
    })
        .catch(function (error) {
        let event = new HtmlEvent({
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
