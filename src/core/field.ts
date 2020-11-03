/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { prop as Property } from "@typegoose/typegoose/lib/prop";

export type FieldType =
  | "text"
  | "numeric"
  | "recordid"
  | "user"
  | "timestamp"
  | "url"
  | "file"
  | "text-multiple-choice"
  | "text-multi-line"
  | "currency";

export class Field {
  constructor(label: string, fieldType: FieldType) {
    this.label = label;
    this.fieldType = fieldType;
  }

  id?: string;

  label: string;

  fieldType: FieldType;

  noWrap: boolean = true;

  bold: boolean = true;

  appearsByDefault: boolean = true;

  addToForms: boolean = true;

  findEnabled: boolean = true;
}
