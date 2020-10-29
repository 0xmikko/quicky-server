/*
 * Stackdrive. Self-order apps for business
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { Inject, Service } from "typedi";
import { ProfileService } from "../services/profileService";
import {
  SocketController,
  socketListeners,
  SocketPusher,
  SocketWithToken
} from "../core/socket";

@Service()
export class ProfilesController implements SocketController {
  @Inject()
  private _service: ProfileService;

  private _namespace = "profile";

  get namespace(): string {
    return this._namespace;
  }

  setPusher(pusher: SocketPusher): void {
    this._service.setPusher(pusher);
  }

  getListeners(socket: SocketWithToken, userId: string): socketListeners {
    return {
      retrieve: async (data: string, opHash: string) => {
        const result = await this._service.retrieve(userId);
        socket.emit(this._namespace + ":updateDetails", result);
        socket.ok(opHash);
      },
      setQBToken: async (token: string, opHash: string) => {
        const result = await this._service.setQBToken(userId, token);
        socket.emit(this._namespace + ":updateDetails", result);
        socket.ok(opHash);
      }
    };
  }
}
