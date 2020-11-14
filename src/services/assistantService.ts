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
import { QuickReplies, QuickReplyValue } from "../core/quickReply";
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

    await this._userRepository.upsert(assistant);
  }

  async proceedRequest(message: Message) {
    console.log("PROCEED RE:", message);

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
      const { responseMessages } = queryResult;
      for (const message of responseMessages || []) {
        if (message.text) {
          answer.text += message.text.text;
        }
      }

      answer.text = answer.text.trim();
      const dfParams = queryResult.parameters?.fields as DialogFlowParams;
      if (dfParams !== undefined) {
        console.log(dfParams);

        answer.quickReplies = this._proceedQuickReplies(dfParams);
      }
      // if (response.queryResult?.match?.intent) {
      //   console.log(
      //     `Matched Intent: ${response.queryResult?.match?.intent.displayName}`
      //   );
      // }

      const currentPage = queryResult.currentPage?.displayName;
      console.log(`Current Page: ${currentPage}`);

      try {
        await this._appService.updateProperty(userId, dfParams);
        if (currentPage)
          answer = await this._proceedPageParameters(
            userId,
            currentPage,
            dfParams,
            answer
          );
      } catch (e) {
        answer.text = e;
      }
    }

    const qrCode = await QRCode.toDataURL("https://google.com", { margin: 10 });

    // answer.image = qrCode //'https://www.docusign.com/sites/default/files/styles/logo_thumbnail__1x__155x_95_/public/solution_showcase_logo/quickbaselogo.png'
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

  // Checks actions driven by page parameters
  // for some particular screens
  protected async _proceedPageParameters(
    userId: string,
    currentPage: string,
    params: DialogFlowParams,
    answer: Message
  ): Promise<Message> {
    const { current_screen } = params;
    switch (currentPage) {
      case "E_1_Main":
        const {
          screens,
          new_screen_confirmed,
          new_screen_title,
          new_screen_type,
          delete_screen
        } = params;
        const screensList = screens?.stringValue?.split(" ") || [];

        for (let screen of screensList) {
          console.log("Trying!!---", screen);
          await this._appService.addNewScreen(userId, screen, screen);
        }

        if (
          new_screen_confirmed?.stringValue === "true" &&
          new_screen_title?.stringValue !== "" &&
          new_screen_type?.stringValue !== ""
        ) {
          await this._appService.addNewScreen(
            userId,
            new_screen_type?.stringValue || "",
            new_screen_title?.stringValue || "New screen"
          );
        }

        if (
          delete_screen?.stringValue === "true" &&
          current_screen?.stringValue !== "" &&
          current_screen?.stringValue !== undefined
        ) {
          await this._appService.deleteScreen(
            userId,
            current_screen?.stringValue
          );
        }

        break;
      case "E_CS_1_Select_screen":
        const screensToShow = await this._appService.listScreens(userId);
        answer.quickReplies = {
          type: "radio",
          keepIt: false,
          values: screensToShow.map(reply => ({ title: reply, value: reply }))
        };
        break;
      case "E_CS_2_Select_action":
        const { field_name, field_type } = params;
        if (
          field_name?.stringValue &&
          field_type?.stringValue &&
          current_screen?.stringValue
        ) {
          console.log("Adding new field");
          await this._appService.addFieldToEntity(
            userId,
            current_screen.stringValue,
            field_name.stringValue,
            field_type.stringValue
          );
        }
        break;

      case "D_3_User_token":
        await this._appService.deployApp(userId);
        break;
    }

    if (current_screen?.stringValue) {
      await this._appService.switchToScreen(userId, current_screen.stringValue);
    }

    return answer;
  }

  //
  protected _proceedQuickReplies(
    params: DialogFlowParams
  ): QuickReplies | undefined {
    const quickRepliesValues: Array<QuickReplyValue> = [];
    const { quickReplies, quickRepliesMulti } = params;
    quickReplies?.stringValue
      ?.split(";")
      .filter(reply => reply !== "")
      .forEach(reply =>
        quickRepliesValues.push({ title: reply, value: reply })
      );

    return quickRepliesValues.length > 0
      ? {
          type:
            quickRepliesMulti?.stringValue === "true" ? "checkbox" : "radio",
          keepIt: false,
          values: quickRepliesValues
        }
      : undefined;
  }

  // Dialog flow session methods

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

  //
}
