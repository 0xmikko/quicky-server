/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { User } from "./user";
import { Field, ID, ObjectType } from "type-graphql";
import {modelOptions, prop as Property, Ref} from "@typegoose/typegoose";
import { ObjectId } from "mongodb";
import { Document } from "mongoose";
import {TimeStamps} from "@typegoose/typegoose/lib/defaultClasses";
import {QuickReplies} from "./quickReply";

@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
})
@ObjectType()
export class Message extends TimeStamps{
  _id: string;

  @Property()
  text: string;

  @Property()
  quickReplies?: QuickReplies

  @Property()
  pending: boolean;

  @Property()
  image?: string

  @Property()
  video?: string

  @Property()
  audio?: string

  @Property({
    ref: 'User',
    required: true,
    // foreignField: "user",
    // localField: "_id"
  })
  user: Ref<User>;

  @Property({
    ref: 'User',
    required: true,
    // foreignField: "user",
    // localField: "_id"
  })
  owner: Ref<User>;

  public get id(): string {
    //@ts-ignore
    return this._id;
  }

}

export interface MessagesRepositoryI {
  findById(chatId: string, messageId: string): Promise<Message | undefined>;
  list(chatId: string): Promise<Message[] | undefined>;
  addMessage(id: string, message: Message): Promise<Message[] | undefined>;
}
