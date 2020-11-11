/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {IsNotEmpty} from "class-validator";
import {User} from "../core/user";
import {EncryptHelper} from "../helpers/encrypt";

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
  id: string;

  name: string;

  avatar_url?: string;

  isQBTokenEntered: boolean;

  qbToken: string;

  hostName?: string;

  constructor(user: User) {
    this.id = user.id;
    this.name = user.name;
    this.avatar_url = user.avatar_url;
    this.isQBTokenEntered =
      user._qbToken !== null &&
      user._qbToken !== "" &&
      user._qbToken !== undefined;
    this.qbToken = EncryptHelper.decrypt(user._qbToken)
    this.hostName = user.hostName;
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
