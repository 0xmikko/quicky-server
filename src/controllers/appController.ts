/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {
  SocketController,
  socketListeners,
  SocketPusher,
  SocketWithToken
} from "../core/socket";
import { Inject, Service } from "typedi";
import { AppService } from "../services/appService";
import { AuthService } from "../services/authService";
import { AssistantService } from "../services/assistantService";

@Service()
export class AppController implements SocketController {
  @Inject()
  private _service: AppService;

  @Inject()
  private _assistantService: AssistantService;

  @Inject()
  private _authService: AuthService;

  private _namespace = "app";

  setPusher(pusher: SocketPusher): void {
    this._service.setPusher(pusher);
  }

  get namespace(): string {
    return this._namespace;
  }

  getListeners(socket: SocketWithToken, userId: string): socketListeners {
    return {
      getAppToken: async (_: string, opHash: string) => {
        const result = await this._authService.getAppToken(userId);
        socket.emit(this._namespace + ":token", result);
        socket.ok(opHash);
      },

      retrieve: async (_: string, opHash: string) => {
        const result = await this._service.retrieve(userId);
        console.log(result);
        socket.emit(this._namespace + ":updateDetails", result);
        socket.ok(opHash);
      },

      list: async (_: string, opHash: string) => {
        const data = await this._service.list(userId);
        console.log(data);
        socket.emit(this._namespace + ":updateList", data);
        socket.ok(opHash);
      },

      new: async (url: string, opHash: string) => {
        await this._service.connectApp(userId, url);
        socket.ok(opHash);
      },

      reset: async (_: string, opHash: string) => {
        await this._assistantService.clearSession(userId);
        socket.ok(opHash);
      }
    };
  }
}
