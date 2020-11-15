/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import { prop as Property } from "@typegoose/typegoose/lib/prop";
import { AppEntity } from "../core/appEntity";
import {Field, FieldType} from "../core/field";

export class ContactEntity extends AppEntity {
  @Property()
  firstName: string;

  @Property()
  lastName: string;

  @Property()
  company: string;

  @Property()
  email: string;

  @Property()
  address: string;

  @Property()
  phone: string;

  @Property()
  mobile: string;

  constructor() {
    super();
    this.icon = "ios-person-circle";
    this.type = "Contact";
    this.description = "Contains contact information";
    this.pluralRecordName = 'contacts'

    this.dataMapper = {
      firstName: new Field("First name", "text"),
      lastName:new Field("Last name", "text"),
      email: new Field("Email", "text"),
      company: new Field("Company", "text"),
    }
  }

  deploy(): Promise<void> {
    return Promise.resolve(undefined);
  }
}
