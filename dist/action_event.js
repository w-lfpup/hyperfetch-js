export class ActionEvent extends Event {
    action;
    constructor(actionStatus, eventInit) {
        super("#action", eventInit);
        this.action = actionStatus;
    }
}
class Action {
    #formData = undefined;
    #dispatchParams;
    #actionType;
    constructor(dispatchParams, actionType) {
        this.#dispatchParams = dispatchParams;
        this.#actionType = actionType;
        let { target } = this.#dispatchParams;
        if (target instanceof HTMLFormElement)
            this.#formData = new FormData(target);
    }
    queue() {
        let { dispatchTarget, event, target } = this.#dispatchParams;
        let actionEvent = new ActionEvent({
            status: "queued",
            type: this.#actionType,
            formData: this.#formData,
            target,
            event,
        });
        dispatchTarget.dispatchEvent(actionEvent);
    }
    exec() {
        if (this.#dispatchParams.abortController?.signal.aborted)
            return;
        let { dispatchTarget, event, target } = this.#dispatchParams;
        let actionEvent = new ActionEvent({
            status: "resolved",
            type: this.#actionType,
            formData: this.#formData,
            target,
            event,
        });
        dispatchTarget.dispatchEvent(actionEvent);
    }
}
export function composeAction(dispatchParams) {
    return new Action(dispatchParams, dispatchParams.type);
}
