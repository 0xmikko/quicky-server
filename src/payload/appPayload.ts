/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {IsNotEmpty} from "class-validator";
import {App} from "../core/app";

export interface QBCredentials {
    hostName: string,
    token: string
}

export class AppPayload {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  created: Date;

  @IsNotEmpty()
  updated: Date;

  @IsNotEmpty()
  dateFormat: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  name: string;

  toApp() : App {
      const app = new App();
      app.qbAppId = this.id
      app.qbCreated = this.created
      app.qbUpdated = this.updated
      app.name = this.name
      return app
  }
}

export interface AppDeploymentData {
    appId: string,
    hostName: string,
    token: string
}
