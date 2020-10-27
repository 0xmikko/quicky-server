
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
    pushPendingQueue(event: SocketUpdate): void
    pushUpdateQueue(event: SocketUpdate): void
}

export interface SocketWithToken extends SocketIO.Socket, SocketPusher {
    tData: tokenData;
    ok: (opHash: string) => void;
    failure: (opHash: string, error: string) => void;
}
