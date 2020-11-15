/*
 * Stackdrive. Self-order apps for business
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { Inject, Service } from "typedi";
import { Profile } from "../payload/userPayload";
import { SocketPusher, SocketPusherDelegateI } from "../core/socket";
import { UserRepository } from "../repository/userRepository";
import { DialogFlowParams } from "../core/dialogFlow";
import { User } from "../core/user";

@Service()
export class ProfileService implements SocketPusherDelegateI {
  @Inject()
  private _repository: UserRepository;

  private _pusher: SocketPusher;

  setPusher(pusher: SocketPusher): void {
    this._pusher = pusher;
  }

  async retrieve(id: string): Promise<Profile | undefined> {
    const user = await this._repository.findById(id);
    if (user === null) return undefined;

    return new Profile(user);
  }

  async setQBToken(
    userId: string,
    qbToken: string
  ): Promise<Profile | undefined> {
    const user = await this._getUserElseThrow(userId);
    user._qbToken = qbToken.trim();
    await this._repository.save(user);
    return new Profile(user);
  }

  async updateWithDFParams(userId: string, params: DialogFlowParams) {
    const user = await this._getUserElseThrow(userId);
    user.updateWithDFParams(params);
    await this._repository.save(user);
  }

  // Protected methods
  async _getUserElseThrow(userId: string): Promise<User> {
    const user = await this._repository.findById(userId);
    if (user === null) throw new Error("User not found");
    return user;
  }
}
