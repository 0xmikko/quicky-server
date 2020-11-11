/*
 * Copyright (c) 2020. Mikhail Lazarev
 */


export interface QuickReplyValue {
  title: string;
  value: string;
}

export interface QuickReplies {
  type: "radio" | 'checkbox';
  keepIt: boolean;
  values: Array<QuickReplyValue>

}
