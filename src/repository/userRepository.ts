/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { User } from "../core/user";
import { Service } from "typedi";
import { MongoRepository } from "./mongoRepository";
import { QBCredentials } from "../payload/appPayload";

@Service()
export class UserRepository extends MongoRepository<User> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this._model.findOne({ email }).exec();
  }

  async getQBTokenElseThrow(id: string): Promise<QBCredentials> {
    const user = await this.findById(id);
    if (user === null || user === undefined) throw new Error("User not found");
    if (user.hostName === undefined)
      throw new Error("Quickbase host name isn't set");
    return {
      hostName: user.hostName,
      token: user.getQBTokenElseThrow()
    };
  }
}
