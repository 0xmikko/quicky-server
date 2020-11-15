/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { Inject, Service } from "typedi";
import { Message } from "../core/message";
import { UserRepository } from "../repository/userRepository";
import { AppService } from "./appService";
import { DialogFlowParams } from "../core/dialogFlow";
import { QuickReplies, QuickReplyValue } from "../core/quickReply";
// @ts-ignore
import QRCode from "qrcode";
import { google } from "@google-cloud/dialogflow-cx/build/protos/protos";
import IQueryResult = google.cloud.dialogflow.cx.v3beta1.IQueryResult;

@Service()
export class AssistantRequestService {
  @Inject()
  private _appService: AppService;

  @Inject()
  private _userRepository: UserRepository;

  async proceedRequest(
    userId: string,
    answer: Message,
    queryResult: IQueryResult
  ): Promise<Message> {
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

    const qrCode = await QRCode.toDataURL("https://google.com", { margin: 10 });

    // answer.image = qrCode //'https://www.docusign.com/sites/default/files/styles/logo_thumbnail__1x__155x_95_/public/solution_showcase_logo/quickbaselogo.png'
    return answer;
  }

  /*
        PROTECTED METHODS
   */


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
          values: screensToShow
            // Settings is not for editing
            .filter(screen => screen !== "Settings")
            .map(reply => ({ title: reply, value: reply }))
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
}
