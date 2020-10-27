/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { Service } from "typedi";
import { Message } from "../core/message";
import { MessageRepository } from "../repository/messageRepository";
import { SocketPusher } from "../core/socket";
import {PostMessageDTO} from "../payload/chatPayload";

@Service()
export class ChatService {
  private _repository: MessageRepository;

  private _pusher: SocketPusher;

  setPusher(pusher: SocketPusher): void {
    this._pusher = pusher;
  }

  async postMessage(userId: string, dto: PostMessageDTO): Promise<Message> {
    return await this._repository.insert({ text: dto.text, user: userId });
  }

  async getMessages(userId: string): Promise<Message[]> {
    return this._repository.listByUser(userId);
  }
}
