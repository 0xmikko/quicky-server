/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { Container, Inject, Service } from "typedi";
import { ChatService } from "./chatService";
import { Message } from "../core/message";
import { UserRepository } from "../repository/userRepository";
import { User } from "../core/user";
import { AppService } from "./appService";
import { SessionsClient } from "@google-cloud/dialogflow-cx";
import * as v3beta1 from "@google-cloud/dialogflow-cx/build/src/v3beta1";
import Config from "../config";
import { DialogFlowParams } from "../core/dialogFlow";
import { QuickReplyValue } from "../core/quickReply";
// @ts-ignore
import QRCode from "qrcode";
import { RedisCache } from "../repository/redisCache";

@Service()
export class AssistantService {
  private _chatService: ChatService;
  private _dfClient: v3beta1.SessionsClient;
  private _dfSessions: Map<string, string>;

  @Inject()
  private _appService: AppService;

  @Inject()
  private _userRepository: UserRepository;

  readonly ASSISTANT_ID = "888888888888888888888888";

  constructor() {
    this._dfClient = new SessionsClient();
    this._dfSessions = new Map<string, string>();
  }

  async start() {
    this._chatService = Container.get(ChatService);
    const assistant = new User();
    assistant._id = this.ASSISTANT_ID;
    assistant.name = "Quicky";
    assistant.role = "Assistant";
    assistant.avatar_url =
      "https://www.docusign.com/sites/default/files/styles/logo_thumbnail__1x__155x_95_/public/solution_showcase_logo/quickbaselogo.png?itok=lOrKXLun&timestamp=1591727466";

    await this._userRepository.upsert(assistant);
  }

  async proceedRequest(message: Message) {
    console.log("PROCEED RE:", message);
    if (message.owner === undefined) throw new Error("No message owner");
    if (message.text === "clear") {
      await this._clearGDFSession(message.owner.toString());
      return;
    }

    const sessionPath = await this._getGDFSessionOrCreate(
      message.owner.toString()
    );
    console.log(sessionPath);
    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message.text
        },
        languageCode: Config.GDFLanguageCode
      }
    };
    const [response] = await this._dfClient.detectIntent(request);
    console.log(`User Query: ${message.text}`);

    const answer = new Message();
    answer.user = this.ASSISTANT_ID;
    answer.owner = message.owner;
    answer.text = "";
    const quickRepliesValues: Array<QuickReplyValue> = [];
    if (
      response.queryResult?.responseMessages === null ||
      response.queryResult?.responseMessages === undefined
    ) {
      answer.text = "Ooops, error happened. We are already fixing it.";
    } else {
      const { responseMessages } = response.queryResult;
      for (const message of responseMessages) {
        if (message.text) {
          answer.text += message.text.text;
        }
      }

      answer.text = answer.text.trim();

      if (response.queryResult.parameters?.fields !== undefined) {
        const { quickReplies } = response.queryResult.parameters
          ?.fields as DialogFlowParams;
        quickReplies?.stringValue
          .split(";")
          .filter(reply => reply !== "")
          .forEach(reply =>
            quickRepliesValues.push({ title: reply, value: reply })
          );
      }
      if (response.queryResult?.match?.intent) {
        console.log(
          `Matched Intent: ${response.queryResult?.match?.intent.displayName}`
        );
      }
      console.log(
        `Current Page: ${response.queryResult.currentPage?.displayName}`
      );
    }

    if (quickRepliesValues.length > 0) {
      answer.quickReplies = {
        type: "checkbox",
        keepIt: false,
        values: quickRepliesValues
      };
    }

    const qrCode = await QRCode.toDataURL("https://google.com", { margin: 10 });

    // answer.image = qrCode //'https://www.docusign.com/sites/default/files/styles/logo_thumbnail__1x__155x_95_/public/solution_showcase_logo/quickbaselogo.png'
    await this._chatService.sendMessage(message.owner.toString(), answer);
  }

  async checkFirstMessage(userId: string) {
    const session = await this._getGDFSession(userId);
    console.log(session);
    if (session !== null) return;
    await this.startNewSession(userId);
  }

  async startNewSession(userId: string) {
    console.log("New session!");
    const message = new Message();

    message.owner = userId;
    message.text = "Hello";
    await this.proceedRequest(message);
  }

  protected async _getGDFSessionOrCreate(userId: string): Promise<string> {
    const redisClient = RedisCache.client;

    const dfSession = await this._getGDFSession(userId);
    if (dfSession !== null) {
      return dfSession;
    }
    const sessionId = Math.random()
      .toString(36)
      .substring(7);
    const sessionPath = this._dfClient.projectLocationAgentSessionPath(
      Config.GDFProjectId,
      Config.GDFLocation,
      Config.GDFAgentId,
      sessionId
    );
    console.info("SESSION!!!", sessionPath);
    await RedisCache.client.set(
      `DF_SESSION_${userId}`,
      sessionPath,
      "EX",
      10000
    );
    return sessionPath;
  }

  protected _getGDFSession(userId: string): Promise<string | null> {
    const redisClient = RedisCache.client;

    return redisClient.get(`DF_SESSION_${userId}`);
  }

  protected async _clearGDFSession(userId: string) {
    const redisClient = RedisCache.client;

    await redisClient.del(`DF_SESSION_${userId}`);
  }

  //
  async _proceed(userId: string, message: Message) {
    const cmd = message.text.split(" ");
    if (cmd.length >= 2) {
      switch (cmd[0].toLowerCase()) {
        case "title":
          await this._appService.updateProperty(userId, "splashTitle", cmd[1]);
          break;
        case "entity":
          switch (cmd[1].toLowerCase()) {
            default:
            case "contact":
              await this._appService.addEntity(userId, cmd[1], "Contact");
              break;
            case "project":
              await this._appService.addEntity(userId, cmd[1], "Project");
              break;
          }
          break;
        case "deploy":
          await this._appService.deployApp(userId);
          break;
      }
    }
  }
}
