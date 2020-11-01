/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {IsDateString, IsNotEmpty, IsString} from "class-validator";
import {Table} from "../core/table";

export class TablePayload {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  alias: string;

  @IsString()
  singleRecordName: string;

  @IsString()
  pluralRecordName: string;

  @IsDateString()
  created: Date;

  @IsDateString()
  updated: Date;

  updateTable(table: Table) {
    table.id = this.id;
    table.name = this.name;
    table.description = this.description;
    table.alias = this.alias;
    table.singleRecordName = this.singleRecordName;
    table.pluralRecordName = this.pluralRecordName;
    table.created = this.created;
    table.updated = this.updated;
  }
}
