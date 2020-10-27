/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

export interface Operation {
    id: string,
    status: string,
}

export type STATUS =
    | "STATUS.LOADING"
    | "STATUS.UPDATING"
    | "STATUS.SUCCESS"
    | "STATUS.FAILURE";

export interface SocketUpdate {
    userId: string
    event: string,
    handler: () => Promise<unknown>,
}
