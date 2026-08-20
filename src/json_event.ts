declare global {
	interface GlobalEventHandlersEventMap {
		["#json"]: JsonEventInterface;
	}
	interface ElementEventMap {
		["#json"]: JsonEventInterface;
	}
}

import type {
	DispatchParams,
	FetchParamsInterface,
	Atom,
} from "./type_flyweight.js";

import { createFetch } from "./type_flyweight.js";

interface JsonRequestQueuedInterface extends FetchParamsInterface {
	status: "queued";
}

interface JsonRequestRequestedInterface extends FetchParamsInterface {
	status: "requested";
}

interface JsonRequestResolvedInterface extends FetchParamsInterface {
	status: "resolved";
	response: Response;
	json: any;
}

interface JsonRequestRejectedInterface extends FetchParamsInterface {
	status: "rejected";
	error: any;
}

export type JsonRequestState =
	| JsonRequestQueuedInterface
	| JsonRequestRequestedInterface
	| JsonRequestResolvedInterface
	| JsonRequestRejectedInterface;

export interface JsonEventInterface {
	readonly requestState: JsonRequestState;
}

export class JsonEvent extends Event implements JsonEventInterface {
	#requestState: JsonRequestState;

	constructor(requestState: JsonRequestState, eventInitDict?: EventInit) {
		super("#json", eventInitDict);
		this.#requestState = requestState;
	}

	get requestState() {
		return this.#requestState;
	}
}

class JsonFetch implements Atom {
	#dispatchParams;
	#request;

	constructor(dispatchParams: DispatchParams, request: Request) {
		this.#dispatchParams = dispatchParams;
		this.#request = request;
	}

	queue(): void {
		let { target } = this.#dispatchParams;

		let { url, method } = this.#request;
		let event = new JsonEvent({ status: "queued", url, method });
		target.dispatchEvent(event);
	}

	exec(): Promise<void> | undefined {
		return fetchJson(this.#dispatchParams, this.#request);
	}
}

export function composeJson(
	dispatchParams: DispatchParams,
): Atom | undefined {
	let request = createFetch(dispatchParams);
	if (!request) return;

	return new JsonFetch(dispatchParams, request);
}

function fetchJson(
	dispatchParams: DispatchParams,
	request: Request,
): Promise<void> | undefined {
	if (dispatchParams.abortController?.signal.aborted) return;

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
		.catch(function (error: any) {
			let event = new JsonEvent({
				status: "rejected",
				error,
				url,
				method,
			});
			dispatchTarget.dispatchEvent(event);
		});
}

function resolveResponseBody(response: Response): Promise<[Response, string]> {
	return Promise.all([response, response.text()]);
}
