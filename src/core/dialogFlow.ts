/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

export interface DFParam {
    stringValue?: string;
    kind: "stringValue";

}

export interface DialogFlowParams {
    quickReplies?: DFParam;
    quickRepliesMulti?: DFParam;

    splash_title?: DFParam;
    splash_title_color?: DFParam;
    splash_subtitle?: DFParam;
    splash_subtitleColor?: DFParam;
    splash_background?: DFParam;

    // templates
    screens?: DFParam;

    // add new screen
    new_screen_type?: DFParam;
    new_screen_title?: DFParam;
    new_screen_confirmed?: DFParam;

    // Edit screen
    current_screen?: DFParam;
    field_name?: DFParam;
    field_type?: DFParam;
    delete_screen?: DFParam;

    // Deployment
    quickbase_url?: DFParam;
    user_token?: DFParam;
}
