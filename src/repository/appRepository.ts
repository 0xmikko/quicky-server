/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { App } from "../core/app";
import { MongoRepository } from "./mongoRepository";
import { Service } from "typedi";

@Service()
export class AppRepository extends MongoRepository<App> {
  constructor() {
    super(App);
  }

  async listByUser(userId: string): Promise<App[]> {
    return await this._model.find({ owner: userId }).exec();
  }

  async findByUser(userId: string): Promise<App | null> {
    return await this._model.findOne({ owner: userId }).exec();
  }
}
