
/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {IsNotEmpty} from "class-validator";
import {Field, ObjectType} from "type-graphql";

export interface tokenData {
  user_id: string;
  role: string;
  exp: number;
}

export interface TokenPair {
  access: string;
  refresh: string;
}

@ObjectType()
export class Profile {

  @Field()
  id: string;

  @Field()
  name: string;

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
