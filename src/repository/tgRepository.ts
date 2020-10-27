/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import TelegramBot from "node-telegram-bot-api";
import config from "../config";

export class TgBot {
  private static bot: TelegramBot;

  static init() {
    TgBot.bot = new TelegramBot(config.tgBotId, { polling: true });

    TgBot.bot.on("message", async (msg) => {
      const chatId = msg.chat.id;

      // send a message to the chat acknowledging receipt of their message
      await TgBot.bot.sendMessage(chatId, `Received your message ${chatId}`);
    });
  }

  static sendNotification(message: string, json?: any) {
    try {
      TgBot.bot.sendMessage(
        config.tgChatId,
        message + "\n\n<pre>" + JSON.stringify(json, null, 2) + "</pre>",
        {
          parse_mode: "HTML",
        }
      );
    } catch (err) {
      console.log(
        "Something went wrong when trying to send a Telegram notification",
        err
      );
    }
  }
}
