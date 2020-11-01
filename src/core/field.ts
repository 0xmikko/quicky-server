/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { prop as Property } from "@typegoose/typegoose/lib/prop";
import { Embedding } from "./embedding";
import {
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString
} from "class-validator";

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
  _id: string;

  @Property({ unique: true, index: true })
  id: string;

  @Property()
  label: string;

  @Property()
  fieldType: FieldType;

  @Property()
  noWrap: boolean;

  @Property()
  bold: boolean;

  @Property()
  required: boolean;

  @Property()
  appearsByDefault: boolean;

  @Property()
  findEnabled: boolean;

  @Property()
  allowNewChoices: boolean;

  @Property()
  sortAsGiven: boolean;

  @Property()
  carryChoices: boolean;
}
