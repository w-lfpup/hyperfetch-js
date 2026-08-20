declare global {
	interface GlobalEventHandlersEventMap {
		["#esmodule"]: EsModuleEventInterface;
	}
	interface ElementEventMap {
		["#esmodule"]: EsModuleEventInterface;
	}
}

import memory from "./memory.js";
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

export type EsModuleRequestState =
	| EsModuleQueuedInterface
	| EsModuleRequestedInterface
	| EsModuleResolvedInterface
	| EsModuleErrorInterface;

export interface EsModuleEventInterface {
	requestState: EsModuleRequestState;
}

interface EsImportParams {
	url: string;
	dispatchTarget: EventTarget;
	event: Event;
}

export class EsModuleEvent extends Event implements EsModuleEventInterface {
	requestState: EsModuleRequestState;

	constructor(requestState: EsModuleRequestState, eventInitDict?: EventInit) {
		super("#esmodule", eventInitDict);
		this.requestState = requestState;
	}
}

// needs to be dispatch params and fetch params?
class EsModuleImport implements Atom {
	#dispatchParams: DispatchParams;
	#importParams;

	constructor(dispatchParams: DispatchParams, importParams: EsImportParams) {
		this.#dispatchParams = dispatchParams;
		this.#importParams = importParams;
	}

	queue(): void {
		let event = new EsModuleEvent({
			status: "queued",
			...this.#importParams,
		});

		document.dispatchEvent(event);
	}

	exec(): Promise<void> | undefined {
		return importEsModule(this.#dispatchParams, this.#importParams);
	}
}

export function composeEsModule(
	dispatchParams: DispatchParams,
): Atom | undefined {
	let { target, dispatchTarget, event, abortController } = dispatchParams;

	let urlAttr = target.getAttribute(`${event.type}:url`);
	if (null === urlAttr) return;

	let url = new URL(urlAttr, location.href).toString();

	if (memory.modules.has(url)) return;
	memory.modules.add(url);

	return new EsModuleImport(dispatchParams, {
		url,
		dispatchTarget,
		event,
	});
}

function importEsModule(
	dispatchParams: DispatchParams,
	esImportParams: EsImportParams,
): Promise<void> | undefined {
	if (dispatchParams.abortController?.signal.aborted) return;

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
		.catch(function (error: any) {
			memory.modules.delete(url);

			let esmoduleEvent = new EsModuleEvent({
				status: "rejected",
				url,
				error,
			});

			document.dispatchEvent(esmoduleEvent);
		});
}
