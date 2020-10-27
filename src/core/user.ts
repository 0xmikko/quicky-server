/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {Chat} from "./chat";
import {Message} from "./message";
import {Field, ID, ObjectType} from "type-graphql";
import {ObjectId} from "mongodb";
import {Document} from "mongoose";

export interface UserID {
  id: string;
}

@ObjectType()
export class User extends Document{
  @Field(type => ID)
  readonly _id: ObjectId;

  @Field()
  email: string;

  @Field()
  name: string;

  @Field()
  given_name: string;

  @Field()
  family_name: string;

  @Field()
  role: string;

  @Field()
  avatar_url: string;

  @Field()
  googleId: string;

  @Field()
  facebookId: string;

  @Field(type => [Message])
  messages: Message[];

}
