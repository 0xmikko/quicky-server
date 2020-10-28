/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { Container, Inject, Service } from "typedi";
import { ChatService } from "./chatService";
import { Message } from "../core/message";
import { UserRepository } from "../repository/userRepository";
import { User } from "../core/user";

@Service()
export class AssistantService {
  private _chatService: ChatService;

  @Inject()
  private _userRepository: UserRepository;

  readonly ASSISTANT_ID = "888888888888888888888888";

  constructor() {}

  async start() {
    this._chatService = Container.get(ChatService);
    const assistant = new User();
    assistant._id = this.ASSISTANT_ID;
    assistant.name = "Quicky";
    assistant.role = "Assistant";

    await this._userRepository.upsert(assistant);
  }

  async proceedRequest(message: Message) {
    if (message.owner === undefined) throw new Error("No message owner");

    const answer = new Message()
    answer.user = this.ASSISTANT_ID;
    answer.owner = message.owner
    answer.text = message.text + ", sure?"

    await this._chatService.sendMessage(message.owner.toString(), answer);
  }
}
