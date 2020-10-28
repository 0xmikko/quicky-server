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
        try {
          const data = await this._service.getMessages(userId);
          console.log(data);
          socket.emit(this._namespace + ":updateList", data);
          socket.ok(opHash);
        } catch (e) {
          console.log(e);
          socket.failure(opHash, e);
        }
      },

      postMessage: async (dto: PostMessageDTO, opHash: string) => {
        console.log(dto);

        try {
          // socket.emit(this._namespace + ":pendingMessage", {
          //   messages: [dto.msg],
          // });

          const newMessage = await this._service.postMessage(userId, dto);
          socket.emit(this._namespace + ":updateMessage", newMessage);
          socket.ok(opHash);
        } catch (e) {
          console.log(e);
          socket.failure(opHash, e);
        }
      }
      //
      // deleteMessage: async (dto: DeleteMessageDTO, opHash: string) => {
      //   console.log(dto);
      //   try {
      //     await this._service.deleteMessage(userId, dto);
      //     socket.ok(opHash);
      //   } catch (e) {
      //     console.log(e);
      //     socket.failure(opHash, e);
      //   }
      // },
    };
  }
}
