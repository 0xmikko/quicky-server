/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {
  SocketController,
  socketListeners,
  SocketPusher,
  SocketWithToken
} from "../core/socket";
import { Container, Service } from "typedi";
import { AppService } from "../services/appService";

@Service()
export class AppController implements SocketController {
  private _service: AppService;
  private _namespace = "app";

  constructor() {
    this._service = Container.get(AppService);
  }

  setPusher(pusher: SocketPusher): void {
    this._service.setPusher(pusher);
  }

  get namespace(): string {
    return this._namespace;
  }

  getListeners(socket: SocketWithToken, userId: string): socketListeners {
    return {
      list: async (_: string, opHash: string) => {
        const data = await this._service.list(userId);
        console.log(data);
        socket.emit(this._namespace + ":updateList", data);
        socket.ok(opHash);
      },

      new: async (url: string, opHash: string) => {
        await this._service.connectApp(userId, url);
        socket.ok(opHash);
      }
    };
  }
}
