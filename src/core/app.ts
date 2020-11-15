/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { modelOptions, Ref } from "@typegoose/typegoose";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { prop as Property } from "@typegoose/typegoose/lib/prop";
import { User } from "./user";
import { AppEntity } from "./appEntity";
import { DialogFlowParams } from "./dialogFlow";

@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
})
export class App extends TimeStamps {
  _id: string;


  constructor() {
    super();
    this.name = "New app";
    this.splashTitle = "Quicky";
    this.splashSubtitle = "AI app builder";
    this.splashTitleColor = "white";
    this.splashSubtitleColor = "white";
    this.splashBackground = "#763e9a";
    this.logoUrl = "https://mobile.quicky.digital/app_logo.png"
  }

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

  @Property({ default: false })
  hidden: boolean;

  @Property({
    ref: "User",
    required: true
  })
  owner: Ref<User>;

  public get id(): string {
    //@ts-ignore
    return this._id;
  }

  // Updates App object with new set of Dialog flow params

  public updateWithDFParams(params: DialogFlowParams) {
    this.splashTitle = params.splash_title?.stringValue || this.splashTitle;

    this.splashSubtitle =
      params.splash_subtitle?.stringValue || this.splashSubtitle;

    this.splashTitleColor =
      params.splash_title_color?.stringValue || this.splashTitleColor;

    this.splashSubtitleColor =
      params.splash_subtitleColor?.stringValue || this.splashSubtitleColor;

    this.splashBackground =
      params.splash_background?.stringValue || this.splashBackground;
  }
}
