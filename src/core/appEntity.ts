/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import { prop as Property } from "@typegoose/typegoose/lib/prop";
import { Field } from "./field";

export type EntityTemplate = "Contact" | "Task" | "Project" | "Deal";

export class AppEntity {
  @Property()
  name: string;

  @Property()
  icon: string;

  @Property()
  template: EntityTemplate;

  @Property()
  dataMapper: Map<string, Field>;

  @Property()
  additionalFields: Array<string>;
}
