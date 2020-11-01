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
  required: boolean;
  appearsByDefault: boolean;
  findEnabled: boolean;
  allowNewChoices: boolean;
  sortAsGiven: boolean;
  carryChoices: boolean;

  toField(): Field {
    const field = new Field();
    field.id = this.id;
    field.label = this.label;
    field.fieldType = this.fieldType;
    field.noWrap = this.noWrap;
    field.bold = this.bold;
    field.required = this.required;
    field.appearsByDefault = this.appearsByDefault;
    field.findEnabled = this.findEnabled;
    field.allowNewChoices = this.allowNewChoices;
    field.sortAsGiven = this.sortAsGiven;
    field.carryChoices = this.carryChoices;
    return field;
  }
}
