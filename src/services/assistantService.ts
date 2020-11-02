/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { Container, Inject, Service } from "typedi";
import { ChatService } from "./chatService";
import { Message } from "../core/message";
import { UserRepository } from "../repository/userRepository";
import { User } from "../core/user";
import { AppService } from "./appService";

@Service()
export class AssistantService {
  private _chatService: ChatService;

  @Inject()
  private _appService: AppService;

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

    const cmd = message.text.split(" ");
    if (cmd.length >= 2) {
      switch (cmd[0].toLowerCase()) {
        case "title":
          await this._appService.updateProperty(
            message.owner.toString(),
            "splashTitle",
            cmd[1]
          );
          break;
        case "entity":
          switch (cmd[1].toLowerCase()) {
            default:
            case "contact":
              await this._appService.addEntity(
                message.owner.toString(),
                cmd[1],
                "Contact"
              );
            case "project":
              await this._appService.addEntity(
                message.owner.toString(),
                cmd[1],
                "Project"
              );
          }

          break;
      }
    }

    const answer = new Message();
    answer.user = this.ASSISTANT_ID;
    answer.owner = message.owner;
    answer.text = message.text + ", sure?";

    await this._chatService.sendMessage(message.owner.toString(), answer);
  }
}
