/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { User } from "../core/user";
import { Service } from "typedi";
import { MongoRepository } from "./mongoRepository";

@Service()
export class UserRepository extends MongoRepository<User> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this._model.findOne({ email }).exec();
  }

  async getQBTokenElseThrow(id: string): Promise<string> {
    const user = await this.findById(id);
    if (user === null || user === undefined) throw new Error("User not found");
    return user.getQBTokenElseThrow();
  }
}
