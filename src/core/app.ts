/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { modelOptions, Ref } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { prop as Property } from "@typegoose/typegoose/lib/prop";
import { User } from "./user";
import { AppEntity } from "./appEntity";

@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
})
export class App extends TimeStamps {
  _id: string;

  @Property()
  qbAppId: string;

  @Property()
  qbHostName: string;

  @Property()
  name: string;

  @Property()
  qbCreated: Date;

  @Property()
  qbUpdated: Date;

  @Property()
  logoUrl: string;

  // SPLASH SCREEN
  @Property()
  splashTitle: string;

  @Property()
  splashTitleColor: string;

  @Property()
  splashSubtitle: string;

  @Property()
  splashSubtitleColor: string;

  @Property()
  splashBackground: string;

  @Property({ type: () => [AppEntity] })
  entities: Array<AppEntity>;

  @Property({
    ref: "User",
    required: true
  })
  owner: Ref<User>;

  public get id(): string {
    //@ts-ignore
    return this._id;
  }
}
