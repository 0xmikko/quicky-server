/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { IsNotEmpty } from "class-validator";
import { Field, ObjectType } from "type-graphql";
import { User } from "../core/user";

export interface tokenData {
  user_id: string;
  role: string;
  exp: number;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

export class Profile {
  @Field()
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  avatar_url?: string;

  isQBTokenEntered: boolean;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.avatar_url = user.avatar_url;
    console.log("QBT", user._qbToken);
    this.isQBTokenEntered =
      user._qbToken !== null &&
      user._qbToken !== "" &&
      user._qbToken !== undefined;
  }
}

export class CodeOAuthDTO {
  @IsNotEmpty()
  code: string;

  uid?: string;
}

export class RefreshTokenReq {
  @IsNotEmpty()
  refresh: string;

  uid?: string;
}
