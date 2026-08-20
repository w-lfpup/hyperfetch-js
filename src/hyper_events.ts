import type { DispatchParams, ComposerCallback } from "./type_flyweight.js";

import { composeAction } from "./action_event.js";
import { composeEsModule } from "./esmodule_event.js";
import { composeJson } from "./json_event.js";
import { composeHtml } from "./html_event.js";
import { throttled } from "./throttle.js";
import { debounced } from "./debounce.js";
import { queued } from "./queue.js";
import { composeArrayBuffer } from "./arraybuffer_events.js";

export interface HyperEventsParamsInterface {
	connected?: boolean;
	eventNames: string[];
	host: EventTarget;
	target?: EventTarget;
	infix?: string;
}

export interface HyperEventsInterface {
	connect(): void;
	disconnect(): void;
}

interface KindAndType {
	kind: string;
	htype: string;
}

const hEventReactions = new Map<string, ComposerCallback>([
	["_esmodule", composeEsModule],
	["_json", composeJson],
	["_html", composeHtml],
	["_arraybuffer", composeArrayBuffer],
	["_action", composeAction],
]);

export class HyperEvents {
	#params: HyperEventsParamsInterface;
	#target: EventTarget;

	constructor(params: HyperEventsParamsInterface) {
		this.#params = params;
		this.#target = params.target ?? params.host;

		if (this.#params.connected) this.connect();
	}

	connect() {
		let { host, eventNames } = this.#params;

		for (let name of eventNames) {
			host.addEventListener(name, this.#dispatch);
		}
	}

	disconnect() {
		let { host, eventNames } = this.#params;

		for (let name of eventNames) {
			host.removeEventListener(name, this.#dispatch);
		}
	}

	#dispatch = this.#unboundDispatch.bind(this);
	#unboundDispatch(event: Event) {
		dispatch(event, this.#target, this.#params.infix);
	}
}

function dispatch(
	event: Event,
	dispatchTarget: EventTarget,
	infix: string = ":",
) {
	let { type } = event;

	for (let target of event.composedPath()) {
		if (!(target instanceof Element)) continue;

		if (target.hasAttribute(`${type}${infix}prevent-default`))
			event.preventDefault();

		if (target.hasAttribute(`${type}${infix}stop-immediate-propagation`))
			return;

		let kindAndType = getKindAndType(event, target, infix);
		if (kindAndType) {
			let { throttle, abortController } = throttled({
				target,
				dispatchTarget,
				event,
				infix,
			});

			// find out if debounce update
			if (throttle) continue;

			let { kind, htype } = kindAndType;
			let dispatchParams: DispatchParams = {
				type: htype,
				target,
				dispatchTarget,
				kind,
				infix,
				event,
				abortController,
			};

			// debounce
			if (!debounced(dispatchParams, dispatchEvent))
				dispatchEvent(dispatchParams);
		}

		if (target.hasAttribute(`${type}${infix}stop-propagation`)) return;
	}
}

function getKindAndType(
	event: Event,
	target: Element,
	infix: string,
): KindAndType | undefined {
	let { type: eventType } = event;

	let kind = target.getAttribute(`${eventType}${infix}`);
	if (!kind) return;

	let htype = target.getAttribute(`${eventType}${infix}type`);

	if (hEventReactions.has(kind) && htype) return { kind, htype };
	if ("_esmodule" === kind) return { kind, htype: htype || "_esmodule" };
	if (kind && !htype) return { kind: "_action", htype: kind };
}

// this could just be an object, ergonomics might be better for debounce
function dispatchEvent(params: DispatchParams) {
	let { kind } = params;

	let composer = hEventReactions.get(kind);
	if (!composer) return;

	let Atom = composer(params);
	if (!Atom) return;

	if (queued(params, Atom)) return;

	Atom.exec();
}
