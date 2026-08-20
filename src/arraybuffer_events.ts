declare global {
	interface GlobalEventHandlersEventMap {
		["#arraybuffer"]: ArrayBufferEventInterface;
	}
	interface ElementEventMap {
		["#arraybuffer"]: ArrayBufferEventInterface;
	}
}

import type {
	DispatchParams,
	FetchParamsInterface,
	Atom,
} from "./type_flyweight.js";

import { createFetch } from "./type_flyweight.js";

interface ArrayBufferRequestQueuedInterface extends FetchParamsInterface {
	status: "queued";
}

interface ArrayBufferRequestRequestedInterface extends FetchParamsInterface {
	status: "requested";
}

interface ArrayBufferRequestResolvedInterface extends FetchParamsInterface {
	status: "resolved";
	response: Response;
	arrayBuffer: ArrayBuffer;
}

interface ArrayBufferRequestRejectedInterface extends FetchParamsInterface {
	status: "rejected";
	error: any;
}

export type ArrayBufferRequestState =
	| ArrayBufferRequestQueuedInterface
	| ArrayBufferRequestRejectedInterface
	| ArrayBufferRequestRequestedInterface
	| ArrayBufferRequestResolvedInterface;

export interface ArrayBufferEventInterface {
	readonly requestState: ArrayBufferRequestState;
}

export class ArrayBufferEvent
	extends Event
	implements ArrayBufferEventInterface
{
	#requestState: ArrayBufferRequestState;

	constructor(requestState: ArrayBufferRequestState, eventInit?: EventInit) {
		super("#html", eventInit);
		this.#requestState = requestState;
	}

	get requestState(): ArrayBufferRequestState {
		return this.#requestState;
	}
}

class ArrayBufferFetch implements Atom {
	#dispatchParams;
	#request;

	constructor(dispatchParams: DispatchParams, request: Request) {
		this.#dispatchParams = dispatchParams;
		this.#request = request;
	}

	queue(): void {
		let { dispatchTarget } = this.#dispatchParams;
		let { url, method } = this.#request;

		let event = new ArrayBufferEvent({ status: "queued", url, method });
		dispatchTarget.dispatchEvent(event);
	}

	exec(): Promise<void> | undefined {
		return fetchArrayBuffer(this.#dispatchParams, this.#request);
	}
}

export function composeArrayBuffer(
	dispatchParams: DispatchParams,
): Atom | undefined {
	let ArrayBufferRequest = createFetch(dispatchParams);
	if (ArrayBufferRequest) {
		return new ArrayBufferFetch(dispatchParams, ArrayBufferRequest);
	}
}

function fetchArrayBuffer(
	dispatchParams: DispatchParams,
	request: Request,
): Promise<void> | undefined {
	if (dispatchParams.abortController?.signal.aborted) return;

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
		.catch(function (error: any) {
			let event = new ArrayBufferEvent({
				status: "rejected",
				error,
				url,
				method,
			});
			dispatchTarget.dispatchEvent(event);
		});
}

function resolveResponseBody(
	response: Response,
): Promise<[Response, ArrayBuffer]> {
	return Promise.all([response, response.arrayBuffer()]);
}
