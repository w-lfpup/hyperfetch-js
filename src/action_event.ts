declare global {
	interface GlobalEventHandlersEventMap {
		["#action"]: ActionEventInterface;
	}
	interface ElementEventMap {
		["action"]: ActionEventInterface;
	}
}

import type { DispatchParams, Atom } from "./type_flyweight.js";

export interface ActionQueuedInterface {
	status: "queued";
	event: Event;
	formData?: FormData;
	target: EventTarget;
	type: string;
}

export interface ActionCompleteInterface {
	status: "resolved";
	event: Event;
	formData?: FormData;
	target: EventTarget;
	type: string;
}

type ActionStatus = ActionQueuedInterface | ActionCompleteInterface;

export interface ActionEventInterface extends Event {
	action: ActionStatus;
}

export class ActionEvent extends Event implements ActionEventInterface {
	action: ActionStatus;

	constructor(actionStatus: ActionStatus, eventInit?: EventInit) {
		super("#action", eventInit);
		this.action = actionStatus;
	}
}

class ActionFetch implements Atom {
	#formData: FormData | undefined = undefined;

	#dispatchParams;
	#actionType;

	constructor(dispatchParams: DispatchParams, actionType: string) {
		this.#dispatchParams = dispatchParams;
		this.#actionType = actionType;

		let { target } = this.#dispatchParams;
		if (target instanceof HTMLFormElement)
			this.#formData = new FormData(target);
	}

	queue(): void {
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

	exec(): Promise<void> | undefined {
		if (this.#dispatchParams.abortController?.signal.aborted) return;

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

export function composeAction(
	dispatchParams: DispatchParams,
): Atom {
	return new ActionFetch(dispatchParams, dispatchParams.type);
}
