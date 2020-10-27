/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { Message } from "../core/message";
import { MongoRepository } from "./mongoRepository";
import { Service } from "typedi";

@Service()
export class MessageRepository extends MongoRepository<Message> {
  constructor() {
    super(Message);
  }

  async listByUser(userId: string): Promise<Message[]> {
    return this._model.find({ user: userId }).exec();
  }
}
