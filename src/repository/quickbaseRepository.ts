/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import axios, { AxiosResponse } from "axios";
import { Service } from "typedi";
import { MongoRepository } from "./mongoRepository";
import { App } from "../core/app";
import { transformAndValidate } from "class-transformer-validator";
import { AppPayload } from "../payload/appPayload";
import { FieldPayload } from "../payload/fieldPayload";
import { TablePayload } from "../payload/tablePayload";

@Service()
export class QuickbaseRepository extends MongoRepository<App> {
  constructor() {
    super(App);
  }

  async getApp(appId: string, hostname: string, token: string): Promise<App> {
    const appDataRaw = await this.get(`/apps/${appId}`, hostname, token);

    const app = (await transformAndValidate(
      AppPayload,
      appDataRaw.data
    )) as AppPayload;

    console.log(app);
    return app.toApp();
  }

  async getTables(
    appId: string,
    hostname: string,
    token: string
  ): Promise<TablePayload[]> {
    const tablesDataRaw = await this.get(
      `/tables?appId=${appId}`,
      hostname,
      token
    );
    const tables = (await transformAndValidate(
      TablePayload,
      tablesDataRaw.data,
      {}
    )) as TablePayload[];

    return tables;
  }

  async getFields(
    tableId: string,
    hostname: string,
    token: string
  ): Promise<FieldPayload[]> {
    const fieldsDataRaw = await this.get(
      `/fields?tableId=${tableId}`,
      hostname,
      token
    );

    return (await transformAndValidate(
      FieldPayload,
      fieldsDataRaw.data,
      {}
    )) as FieldPayload[];
  }

  async listByUser(userId: string): Promise<App[]> {
    return await this._model.find({ owner: userId }).exec();
  }

  async get(
    path: string,
    hostname: string,
    token: string
  ): Promise<AxiosResponse<any>> {
    return axios.get(`https://api.quickbase.com/v1${path}`, {
      headers: {
        "QB-Realm-Hostname": hostname,
        Authorization: `QB-USER-TOKEN ${token}`
      }
    });
  }
}
