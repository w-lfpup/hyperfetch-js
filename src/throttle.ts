/*
	For now throttle-state resides in module scope @ window.$hyperevents.throttler
	
	A stretch-goal might be attaching the queue map to the window itself.
*/

import memory from "./memory.js";

interface Params {
	target: Element;
	dispatchTarget: EventTarget;
	event: Event;
	infix: string;
}

export interface Throttler {
	abortController: AbortController;
	event: Event;
}

interface ThrottleResult {
	throttle: boolean;
	abortController?: AbortController;
}

export function throttled(params: Params): ThrottleResult {
	let abortController: AbortController | undefined = undefined;

	let windowMs = getThrottleParams(params);
	if (!windowMs) return { throttle: false };

	if (shouldThrottle(params, windowMs)) return { throttle: true };

	let { target, event } = params;

	abortController = new AbortController();
	window.$hyperevents.throttler.set(target, { event, abortController });

	return { throttle: false, abortController };
}

function getThrottleParams(dispatchParams: Params): number | undefined {
	let { target, event, infix } = dispatchParams;

	let windowMsAttr = target.getAttribute(`${event.type}${infix}throttle-ms`);
	if (null === windowMsAttr) return;

	let windowMs = parseInt(windowMsAttr);
	if (!Number.isNaN(windowMs)) return windowMs;
}

function shouldThrottle(dispatchParams: Params, windowMs: number): boolean {
	let { target, event } = dispatchParams;

	let throttler = memory.throttler.get(target);
	if (throttler) {
		let { event: prevEvent, abortController } = throttler;

		let delta = Math.max(0, event.timeStamp - prevEvent.timeStamp);
		if (event.type === prevEvent.type && delta < windowMs) return true;

		abortController.abort();
	}

	return false;
}
