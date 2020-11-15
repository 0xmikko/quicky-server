/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import { AppEntity } from "../core/appEntity";
import { Field } from "../core/field";

export class SettingsEntity extends AppEntity {
  constructor() {
    super();
    this.icon = "ios-cog";
    this.name = "Settings";
    this.type = "Setting";
    this.order = 1000;
    this.description =
      "Please, do not change this table! It contains settings of your app";
    this.pluralRecordName = "settings";
    this.dataMapper = {
      name: new Field("Settings", "text")
    };
  }

  deploy(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
