/*
 * Stackdrive. Self-order apps for business
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { Inject, Service } from "typedi";
import { Profile } from "../payload/userPayload";
import { SocketPusher, SocketPusherDelegateI } from "../core/socket";
import { UserRepository } from "../repository/userRepository";

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

  async setQBToken(id: string, qbToken: string): Promise<Profile | undefined> {
    const user = await this._repository.findById(id);
    if (user === null) throw new Error("User not found");
    user._qbToken = qbToken;
    await this._repository.save(user);
    return new Profile(user);
  }
  // async updateScreenTime(userId: string, time: number) {
  //   const profile = await this._repository.findOne(userId);
  //   if (profile === undefined) throw CantUpdateScreenTimeError;
  // }
}
