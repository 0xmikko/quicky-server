
/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import SocketIO from "socket.io";
import {SocketUpdate} from "./operations";
import {tokenData} from "../payload/userPayload";

export type socketListeners = Record<string, (...args: any[]) => Promise<void>>;

export interface SocketPusherDelegateI {
    setPusher(pusher: SocketPusher): void;
}

export interface SocketController extends SocketPusherDelegateI {
    namespace: string;
    getListeners: (socket: SocketWithToken, userId: string) => socketListeners;
}

export interface SocketPusher {
    pushUpdateQueue(event: SocketUpdate): void
}

export abstract class SocketPusherDelegate {
    protected _pusher: SocketPusher;

    setPusher(pusher: SocketPusher): void {
        this._pusher = pusher;
    }

}

export interface SocketWithToken extends SocketIO.Socket, SocketPusher {
    tData: tokenData;
    ok: (opHash: string) => void;
    failure: (opHash: string, error: string) => void;
}
