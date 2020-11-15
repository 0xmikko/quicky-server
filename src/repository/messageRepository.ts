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

  async getFull(id: string): Promise<Message | null> {
    return await this._model
      .findById(id)
      .populate("user", "name")
      .exec();
  }

  async listByUser(userId: string): Promise<Message[]> {
    return await this._model
      .find({ owner: userId, session: "current" })
      .populate("user", "name")
      .exec();
  }

  async finalizeSession(userId: string) {
    await this._model
      .updateMany(
        { owner: userId, session: "current" },
        { session: new Date().toISOString() }
      )
      .exec();
  }
}
