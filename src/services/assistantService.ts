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
import { RedisCache } from "../repository/redisCache";
import { AssistantRequestService } from "./assistantRequestService";

@Service()
export class AssistantService {
  private _chatService: ChatService;
  private _dfClient: v3beta1.SessionsClient;
  private _dfSessions: Map<string, string>;

  @Inject()
  private _assistantRequestService: AssistantRequestService;

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

    await this._userRepository.upsert(assistant);
  }

  async proceedRequest(message: Message) {
    if (message.owner === undefined) throw new Error("No message owner");

    const userId = message.owner.toString();
    const sessionPath = await this._getGDFSessionOrCreate(userId);

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

    let answer = new Message();
    answer.user = this.ASSISTANT_ID;
    answer.owner = message.owner;
    answer.text = "";
    const { queryResult } = response;
    if (!queryResult) {
      answer.text = "Ooops, error happened. We are already fixing it.";
    } else {
      answer = await this._assistantRequestService.proceedRequest(
        userId,
        answer,
        queryResult
      );
    }

    await this._chatService.sendMessage(userId, answer);
  }

  async checkFirstMessage(userId: string) {
    const session = await this._getGDFSession(userId);
    if (session !== null) return;
    await this.startNewSession(userId);
  }

  async startNewSession(userId: string) {
    const message = new Message();
    message.owner = userId;
    message.text = "Hello";
    await this.proceedRequest(message);
  }

  async clearSession(userId: string) {
    await this._appService.clearApp(userId);

    const message = new Message();
    message.owner = userId;
    message.text = "Session reset";
    message.user = this.ASSISTANT_ID;

    await this._chatService.sendMessage(userId, message);
    const redisClient = RedisCache.client;
    await redisClient.del(`DF_SESSION_${userId}`);

    await this.checkFirstMessage(userId);
  }

  // PROTECTED METHODS

  protected async _getGDFSessionOrCreate(userId: string): Promise<string> {
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

  //
}
