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
import { AppEntity } from "../core/appEntity";
import {Field} from "../core/field";

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

  async createTableFromEntity(
    appId: string,
    hostname: string,
    token: string,
    entity: AppEntity
  ) : Promise<string> {
    const tablesDataRaw = await this.post(
      `/tables?appId=${appId}`,
      hostname,
      token,
      {
        name: entity.name,
        description: entity.description,
        singleRecordName: entity.type.toLowerCase(),
        pluralRecordName: entity.pluralRecordName
      }
    );

    if (tablesDataRaw.status !== 201 && tablesDataRaw.status !== 200) {
      throw new Error("Network error, cant create Quickbase table ")
    }

    return tablesDataRaw.data.id;
  }

  async createFieldAtTable(
      tableId: string,
      hostname: string,
      token: string,
      field: Field,
  ) : Promise<string> {
    const fieldDataRaw = await this.post(
        `/fields?tableId=${tableId}`,
        hostname,
        token,
        FieldPayload.fromField(field),
    );

    if (fieldDataRaw.status !== 201 && fieldDataRaw.status !== 200) {
      throw new Error("Network error, cant create Quickbase table ")
    }

    console.log(fieldDataRaw.data)
    return fieldDataRaw.data.id;
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

  async post(
    path: string,
    hostname: string,
    token: string,
    body: any
  ): Promise<AxiosResponse<any>> {
    return axios.post(`https://api.quickbase.com/v1${path}`, body, {
      headers: {
        "QB-Realm-Hostname": hostname,
        Authorization: `QB-USER-TOKEN ${token}`
      }
    });
  }
}
