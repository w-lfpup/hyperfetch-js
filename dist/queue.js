import memory from "./memory.js";
export class Queue {
    #inRoute;
    #inbound = [];
    #outbound = [];
    enqueue(atom) {
        this.#inbound.push(atom);
        atom.queue();
        if (!this.#inRoute)
            this.#queueAtom();
    }
    #queueAtom() {
        if (!this.#outbound.length) {
            while (this.#inbound.length) {
                let pip = this.#inbound.pop();
                if (pip)
                    this.#outbound.push(pip);
            }
        }
        this.#inRoute = this.#outbound.pop();
        this.#execAtom();
    }
    async #execAtom() {
        if (this.#inRoute) {
            await this.#inRoute.exec();
            this.#queueAtom();
        }
    }
}
export function queued(dispatchParams, atom) {
    let { target, event, infix } = dispatchParams;
    let queueAttr = target.hasAttribute(`${event.type}${infix}queue`);
    if (queueAttr)
        memory.queue.enqueue(atom);
    return queueAttr;
}
