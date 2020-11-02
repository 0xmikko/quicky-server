/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import { prop as Property } from "@typegoose/typegoose/lib/prop";
import { Field } from "./field";

export type EntityType = "Contact" | "Task" | "Project" | "Settings";

export interface IAppEntity {
  deploy(): Promise<void>;
}

export abstract class AppEntity implements IAppEntity {
  @Property()
  name: string;

  @Property()
  icon: string;

  @Property()
  template: EntityType;

  @Property()
  order: number

  @Property()
  appId: string;

  @Property()
  tableId: string;

  @Property()
  dataMapper: Record<string, Field>;

  @Property()
  additionalFields: Array<string>;

  @Property()
  isDeployed: boolean

  abstract deploy(): Promise<void>;
}
