/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import { AppEntity } from "../core/appEntity";
import { Field } from "../core/field";

export class ContactEntity extends AppEntity {
  constructor() {
    super();
    this.icon = "ios-person-circle";
    this.type = "Contact";
    this.description = "Contains contact information";
    this.pluralRecordName = "contacts";

    this.dataMapper = {
      firstName: new Field("First name", "text"),
      lastName: new Field("Last name", "text"),
      email: new Field("Email", "text"),
      company: new Field("Company", "text")
    };
  }
}
