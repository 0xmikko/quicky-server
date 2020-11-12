/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { Inject, Service } from "typedi";
import { Message } from "../core/message";
import { MessageRepository } from "../repository/messageRepository";
import {SocketPusher, SocketPusherDelegate} from "../core/socket";
import { PostMessageDTO } from "../payload/chatPayload";
import { AssistantService } from "./assistantService";

@Service()
export class ChatService extends SocketPusherDelegate{
  @Inject()
  private _repository: MessageRepository;

  @Inject()
  private _assistantService: AssistantService;

  async postMessage(userId: string, dto: PostMessageDTO): Promise<Message> {
    const newMessage = await this._repository.insert({
      text: dto.text,
      user: userId,
      owner: userId
    } as Message);

    const savedMessage = await this._repository.getFull(newMessage.id);
    if (savedMessage === null) throw new Error("Cant save message");
    await this._assistantService.proceedRequest(savedMessage)

    return savedMessage;
  }

  async getMessages(userId: string): Promise<Record<string, Message>> {
    const result: Record<string, Message> = {};
    const messages = await this._repository.listByUser(userId);
    messages.map(msg => (result[msg._id] = msg));
    await this._assistantService.checkFirstMessage(userId);

    return result;
  }

  async sendMessage(userId: string, message: Message) {
    const newMessage = await this._repository.insert(message);

    this._pusher.pushUpdateQueue({
      userId: userId,
      event: "chat:updateMessage",
      handler: () => this._repository.getFull(newMessage.id)
    });
  }
}
