export interface DispatchParams {
	kind: string;
	target: Element;
	event: Event;
	dispatchTarget: EventTarget;
	abortController?: AbortController;
	type: string;
	infix: string;
}

interface RequestParams {
	method: string;
	timeoutMs: number;
	url: string;
}

export interface Atom {
	queue(): void;
	exec(): Promise<void> | undefined;
}

export interface ComposerCallback {
	(params: DispatchParams): Atom | undefined;
}

export interface FetchParamsInterface {
	url: string;
	method: string;
}

const FALLBACK_TIMEOUT_MS = 10000;

export function createFetch(
	dispatchParams: DispatchParams,
): Request | undefined {
	let requestParams = getRequestParams(dispatchParams);
	if (!requestParams) return;

	return createRequest(dispatchParams, requestParams);
}

function getRequestParams(
	dispatchParams: DispatchParams,
): RequestParams | undefined {
	let { target, event, infix } = dispatchParams;
	let { type } = event;

	let url = target.getAttribute(`${type}${infix}url`);
	if (!url) return;

	let method = target.getAttribute(`${type}${infix}method`) ?? "GET";
	let timeoutMsAttr = target.getAttribute(`${type}${infix}timeout-ms`);
	let timeoutMs = parseInt(timeoutMsAttr ?? "");
	if (Number.isNaN(timeoutMs)) timeoutMs = FALLBACK_TIMEOUT_MS;

	return {
		timeoutMs,
		url,
		method,
	};
}

function createRequest(
	dispatchParams: DispatchParams,
	requestParams: RequestParams,
): Request {
	let { abortController, target } = dispatchParams;
	let { url, timeoutMs, method } = requestParams;

	let signals = [AbortSignal.timeout(timeoutMs)];
	if (abortController) signals.push(abortController.signal);
	let signal = AbortSignal.any(signals);

	let formData: FormData | undefined;
	if (target instanceof HTMLFormElement) formData = new FormData(target);

	return new Request(url, {
		body: formData,
		signal,
		method,
	});
}
