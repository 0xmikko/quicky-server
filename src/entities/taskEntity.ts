/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import { AppEntity } from "../core/appEntity";
import { Field } from "../core/field";

export class TaskEntity extends AppEntity {
  constructor() {
    super();
    this.icon = "ios-radio-button-off";
    this.type = "Task";
    this.description = "Contains company tasks";
    this.pluralRecordName = "tasks";

    this.dataMapper = {
      name: new Field("Name", "text"),
      status: new Field("Status", "text"),
      description: new Field("Description", "text"),
      deadline: new Field("Deadline", "timestamp"),
      ProjectId: new Field("ProjectId", "numeric")
    };
  }
}
