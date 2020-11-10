/*
 * Copyright (c) 2020. Mikhail Lazarev
 */


export interface QuickReplyValue {
  title: string;
  value: string;
}

export interface QuickReplies {
  type: "radio";
  keepIt: boolean;
  values: Array<QuickReplyValue>

}
