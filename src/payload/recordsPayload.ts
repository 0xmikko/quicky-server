/*
 * Copyright (c) 2020, Mikael Lazarev
 */
import {IsNotEmpty} from 'class-validator';
import {FieldPayload} from './fieldPayload';

export class RecordValue {
  @IsNotEmpty()
  value: string | number | Date;
}

export class RecordsPayload {
  @IsNotEmpty()
  data: Array<Record<number, RecordValue>>;

  @IsNotEmpty()
  fields: Array<FieldPayload>;
}
