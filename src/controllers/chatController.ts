/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {
  SocketController,
  socketListeners,
  SocketPusher,
  SocketWithToken
} from "../core/socket";
import { PostMessageDTO } from "../payload/chatPayload";
import { Container, Service } from "typedi";
import { ChatService } from "../services/chatService";

@Service()
export class ChatController implements SocketController {
  private _service: ChatService;
  private _namespace = "chat";

  constructor() {
    this._service = Container.get(ChatService);
  }

  setPusher(pusher: SocketPusher): void {
    this._service.setPusher(pusher);
  }

  get namespace(): string {
    return this._namespace;
  }

  getListeners(socket: SocketWithToken, userId: string): socketListeners {
    return {
      messages: async (_: string, opHash: string) => {
        const data = await this._service.getMessages(userId);
        socket.emit(this._namespace + ":updateList", data);
        socket.ok(opHash);
      },

      postMessage: async (dto: PostMessageDTO, opHash: string) => {
        const newMessage = await this._service.postMessage(userId, dto);
        socket.emit(this._namespace + ":updateMessage", newMessage);
        socket.ok(opHash);
      }
    };
  }
}
