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
export declare class ActionEvent extends Event implements ActionEventInterface {
    action: ActionStatus;
    constructor(actionStatus: ActionStatus, eventInit?: EventInit);
}
export declare function composeAction(dispatchParams: DispatchParams): Atom;
export {};
