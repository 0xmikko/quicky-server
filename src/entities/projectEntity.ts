/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import {AppEntity} from "../core/appEntity";

export class ProjectEntity extends AppEntity {

  constructor() {
    super();
    this.icon = "ios-briefcase";
    this.type = "Project";
    this.description = "Contains company projects";
    this.pluralRecordName = 'projects'
  }

  deploy(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
