/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import { prop as Property } from "@typegoose/typegoose/lib/prop";
import { AppEntity } from "../core/appEntity";

export class ProjectEntity extends AppEntity {

  constructor() {
    super();
    this.icon = "ios-briefcase";
    this.template = "Project";
  }

  deploy(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
