/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {User} from "./user";
import {Field, ID, ObjectType} from "type-graphql";
import {prop as Property} from "@typegoose/typegoose";
import {Ref} from "./types";
import {ObjectId} from "mongodb";
import {Document} from "mongoose";

@ObjectType()
export class Message extends Document{
  @Field(type => ID)
  readonly _id: ObjectId;

  @Field()
  @Property()
  text: string;

  // @Field(type=>Chat)
  // @Property()
  // chat: Chat;

  @Field(type => User)
  @Property({ ref: Message, required: true })
  user: Ref<User>;
}

export interface MessagesRepositoryI {
  findById(chatId: string, messageId: string): Promise<Message | undefined>;
  list(chatId: string): Promise<Message[] | undefined>;
  addMessage(id: string, message: Message): Promise<Message[] | undefined>;
}
