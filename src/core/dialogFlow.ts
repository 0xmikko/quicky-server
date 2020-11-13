/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

export class DFParam {
    stringValue: string;
    kind: "stringValue";

    get value() : string {
        return this.stringValue
    }
}

export interface DialogFlowParams {
    quickReplies?: DFParam;
    quickRepliesMulti?: DFParam;

    splashtitle?: DFParam;
    splashTitleColor?: DFParam;
    splashSubtitle?: DFParam;
    splashSubtitleColor?: DFParam;
    splashBackground?: DFParam;

    screens?: DFParam;
    newScreenType?: DFParam;
    newscreentitle?: DFParam;
    newScreenConfirmed?: DFParam;
}
