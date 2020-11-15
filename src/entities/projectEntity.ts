/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import { AppEntity } from "../core/appEntity";
import { Field } from "../core/field";

export class ProjectEntity extends AppEntity {
  constructor() {
    super();
    this.icon = "ios-briefcase";
    this.type = "Project";
    this.description = "Contains company projects";
    this.pluralRecordName = "projects";

    this.dataMapper = {
      name: new Field("Name", "text"),
      status: new Field("Status", "text"),
      priority: new Field("Priority", "text"),
      projectCondition: new Field("Condition", "text"),
      startDate: new Field("Start date", "timestamp"),
      finishDate: new Field("Finish date", "timestamp")
    };
  }

  deploy(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
