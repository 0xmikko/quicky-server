/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import { prop as Property } from "@typegoose/typegoose/lib/prop";
import { Field } from "./field";

export type EntityType = "Contact" | "Task" | "Project" | "Setting";

export abstract class AppEntity  {
  @Property()
  name: string;

  @Property()
  icon: string;

  @Property()
  type: EntityType;

  @Property()
  order: number

  @Property()
  appId: string;

  @Property()
  tableId: string;

  @Property()
  description: string;

  @Property()
  pluralRecordName: string;

  @Property()
  dataMapper: Record<string, Field>;

  @Property()
  additionalFields: Array<string>;

  @Property()
  isDeployed: boolean

}
