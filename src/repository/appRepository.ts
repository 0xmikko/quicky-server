/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { App } from "../core/app";
import { MongoRepository } from "./mongoRepository";
import { Service } from "typedi";
import axios from "axios";
import { transformAndValidate } from "class-transformer-validator";
import { AppPayload } from "../payload/appPayload";

@Service()
export class AppRepository extends MongoRepository<App> {
  constructor() {
    super(App);
  }

  async getAppDataQB(
    appId: string,
    hostname: string,
    token: string
  ): Promise<App> {
    const appDataRaw = await axios.get(
      `https://api.quickbase.com/v1/apps/${appId}`,
      {
        headers: {
          "QB-Realm-Hostname": hostname,
          Authorization: `QB-USER-TOKEN ${token}`
        }
      }
    );

    console.log(appDataRaw.data)
    const app = (await transformAndValidate(
      AppPayload,
      appDataRaw.data
    )) as AppPayload;

    console.log(app)
    return app.toApp();
  }

  async listByUser(userId: string): Promise<App[]> {
    return await this._model.find({ owner: userId }).exec();
  }
}
