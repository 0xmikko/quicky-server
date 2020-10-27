/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {Message} from "./message";
import {prop as Property} from "@typegoose/typegoose";
import {Field, ID, ObjectType} from "type-graphql";
import {ObjectId} from "mongodb";
import {Ref} from "./types";

@ObjectType()
export class Chat {
  @Field((type) => ID)
  readonly _id: ObjectId;

  @Field((type) => [Message])
  @Property({ itemsRef: Message, required: true })
  messages: Ref<Message>[];

}
