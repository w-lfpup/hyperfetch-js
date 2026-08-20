declare global {
	interface GlobalEventHandlersEventMap {
		["#html"]: HtmlEventInterface;
	}
	interface ElementEventMap {
		["#html"]: HtmlEventInterface;
	}
}

import type {
	DispatchParams,
	FetchParamsInterface,
	Atom,
} from "./type_flyweight.js";

import { createFetch } from "./type_flyweight.js";

interface HtmlRequestQueuedInterface extends FetchParamsInterface {
	status: "queued";
}

interface HtmlRequestRequestedInterface extends FetchParamsInterface {
	status: "requested";
}

interface HtmlRequestResolvedInterface extends FetchParamsInterface {
	status: "resolved";
	response: Response;
	html: string;
}

interface HtmlRequestRejectedInterface extends FetchParamsInterface {
	status: "rejected";
	error: any;
}

export type HtmlRequestState =
	| HtmlRequestQueuedInterface
	| HtmlRequestRejectedInterface
	| HtmlRequestRequestedInterface
	| HtmlRequestResolvedInterface;

export interface HtmlEventInterface {
	readonly requestState: HtmlRequestState;
}

export class HtmlEvent extends Event implements HtmlEventInterface {
	#requestState: HtmlRequestState;

	constructor(requestState: HtmlRequestState, eventInit?: EventInit) {
		super("#html", eventInit);
		this.#requestState = requestState;
	}

	get requestState(): HtmlRequestState {
		return this.#requestState;
	}
}

class HtmlFetch implements Atom {
	#dispatchParams;
	#request;

	constructor(dispatchParams: DispatchParams, request: Request) {
		this.#dispatchParams = dispatchParams;
		this.#request = request;
	}

	queue(): void {
		let { dispatchTarget } = this.#dispatchParams;
		let { url, method } = this.#request;

		let event = new HtmlEvent({ status: "queued", url, method });
		dispatchTarget.dispatchEvent(event);
	}

	exec(): Promise<void> | undefined {
		return fetchHtml(this.#dispatchParams, this.#request);
	}
}

export function composeHtml(
	dispatchParams: DispatchParams,
): Atom | undefined {
	let htmlRequest = createFetch(dispatchParams);
	if (!htmlRequest) return;

	return new HtmlFetch(dispatchParams, htmlRequest);
}

function fetchHtml(
	dispatchParams: DispatchParams,
	request: Request,
): Promise<void> | undefined {
	if (dispatchParams.abortController?.signal.aborted) return;

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
		.catch(function (error: any) {
			let event = new HtmlEvent({
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
