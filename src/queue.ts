/*
	For now the queue-state resides in module scope.
	
	A stretch-goal might be attaching the queue map to the window itself.
*/
import type { DispatchParams, Atom } from "./type_flyweight.js";

import memory from "./memory.js";

export class Queue {
	#inRoute: Atom | undefined;
	#inbound: Atom[] = [];
	#outbound: Atom[] = [];

	enqueue(atom: Atom) {
		this.#inbound.push(atom);
		atom.queue();

		if (!this.#inRoute) this.#queueAtom();
	}

	#queueAtom() {
		if (!this.#outbound.length) {
			while (this.#inbound.length) {
				let pip = this.#inbound.pop();
				if (pip) this.#outbound.push(pip);
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

export function queued(
	dispatchParams: DispatchParams,
	atom: Atom,
): boolean {
	let { target, event, infix } = dispatchParams;

	let queueAttr = target.hasAttribute(`${event.type}${infix}queue`);
	if (queueAttr) memory.queue.enqueue(atom);

	return queueAttr;
}
