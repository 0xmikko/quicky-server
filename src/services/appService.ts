/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import { Inject, Service } from "typedi";
import { AppRepository } from "../repository/appRepository";
import { UserRepository } from "../repository/userRepository";
import {SocketPusher, SocketPusherDelegate} from "../core/socket";
import {App} from "../core/app";

@Service()
export class AppService extends SocketPusherDelegate {
  @Inject()
  private _repository: AppRepository;

  @Inject()
  private _userRepository: UserRepository;

  async connectApp(userId: string, url: string) {
    const qbToken = await this._userRepository.getQBTokenElseThrow(userId);
    console.log(qbToken);
    const appId = "bqxwp8kss"
    const hostName = "hackathon20-mlazarev.quickbase.com"
    const app = await this._repository.getAppDataQB(appId, hostName, qbToken);

    console.log("APP", app);
  }

  async list(userId: string) : Promise<App[]> {
      return await this._repository.listByUser(userId)
  }
}
