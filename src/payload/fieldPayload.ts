/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {Field, FieldType} from "../core/field";

export class FieldPayload {
  id: string;
  label: string;
  fieldType: FieldType;
  noWrap: boolean;
  bold: boolean;
  appearsByDefault: boolean;
  findEnabled: boolean;

  toField(): Field {
    const field = new Field(this.label, this.fieldType);
    field.id = this.id;
    field.noWrap = this.noWrap;
    field.bold = this.bold;
    field.appearsByDefault = this.appearsByDefault;
    field.findEnabled = this.findEnabled;
    return field;
  }

  static fromField(from: Field) : FieldPayload {
    const field = new FieldPayload()
    field.label = from.label;
    field.fieldType = from.fieldType;
    field.noWrap = from.noWrap;
    field.bold = from.bold;
    field.appearsByDefault = from.appearsByDefault;
    field.findEnabled = from.findEnabled;
    return field;
  }
}
