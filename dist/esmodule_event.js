import memory from "./memory.js";
export class EsModuleEvent extends Event {
    requestState;
    constructor(requestState, eventInitDict) {
        super("#esmodule", eventInitDict);
        this.requestState = requestState;
    }
}
class EsModuleImport {
    #dispatchParams;
    #importParams;
    constructor(dispatchParams, importParams) {
        this.#dispatchParams = dispatchParams;
        this.#importParams = importParams;
    }
    queue() {
        let event = new EsModuleEvent({
            status: "queued",
            ...this.#importParams,
        });
        document.dispatchEvent(event);
    }
    exec() {
        return importEsModule(this.#dispatchParams, this.#importParams);
    }
}
export function composeEsModule(dispatchParams) {
    let { target, dispatchTarget, event, abortController } = dispatchParams;
    let urlAttr = target.getAttribute(`${event.type}:url`);
    if (null === urlAttr)
        return;
    let url = new URL(urlAttr, location.href).toString();
    if (memory.modules.has(url))
        return;
    memory.modules.add(url);
    return new EsModuleImport(dispatchParams, {
        url,
        dispatchTarget,
        event,
    });
}
function importEsModule(dispatchParams, esImportParams) {
    if (dispatchParams.abortController?.signal.aborted)
        return;
    let { url } = esImportParams;
    let esmoduleEvent = new EsModuleEvent({ status: "requested", url });
    document.dispatchEvent(esmoduleEvent);
    return import(url)
        .then(function () {
        let esmoduleEvent = new EsModuleEvent({
            status: "resolved",
            url,
        });
        document.dispatchEvent(esmoduleEvent);
    })
        .catch(function (error) {
        memory.modules.delete(url);
        let esmoduleEvent = new EsModuleEvent({
            status: "rejected",
            url,
            error,
        });
        document.dispatchEvent(esmoduleEvent);
    });
}
