/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

export interface DFParam {
    stringValue: string,
    kind: "stringValue"
}

export interface DialogFlowParams {
    quickReplies?: DFParam,
}
