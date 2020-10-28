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


}
