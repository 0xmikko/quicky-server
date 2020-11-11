/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
require("dotenv").config();
import fs from "fs";
import { validate, IsNotEmpty } from "class-validator";

export class Config {
  static port: number;

  @IsNotEmpty()
  static database_url: string;

  @IsNotEmpty()
  static redis_url: string;

  @IsNotEmpty()
  static jwt_secret: string;

  @IsNotEmpty()
  static picturesImagesBucket: string;

  @IsNotEmpty()
  static authGoogleClientID: string;

  @IsNotEmpty()
  static authGoogleClientSecret: string;

  @IsNotEmpty()
  static authGoogleDevRedirectUrl: string;

  @IsNotEmpty()
  static authGoogleProdRedirectUrl: string;

  @IsNotEmpty()
  static sentryDSN: string;

  @IsNotEmpty()
  static tgBotId: string;

  @IsNotEmpty()
  static tgChatId: string;

  @IsNotEmpty()
  static GDFProjectId: string;

  @IsNotEmpty()
  static GDFLocation: string;

  @IsNotEmpty()
  static GDFAgentId: string;

  @IsNotEmpty()
  static GDFLanguageCode: string;

  static init() {
    Config.port = parseInt(process.env.PORT || "4000");
    Config.database_url = process.env.DATABASE_URL || "";
    Config.redis_url = process.env.REDIS_URL || "";
    Config.jwt_secret = process.env.JWT_SECRET || "";
    Config.picturesImagesBucket = process.env.GCP_PICUTRES_BUCKET || "";
    Config.authGoogleClientID = process.env.AUTH_GOOGLE_CLIENT_ID || "";
    Config.authGoogleClientSecret = process.env.AUTH_GOOGLE_SECRET || "";
    Config.authGoogleDevRedirectUrl =
      process.env.AUTH_GOOGLE_DEV_REDIRECT_URL || "";
    Config.authGoogleProdRedirectUrl =
      process.env.AUTH_GOOGLE_PROD_REDIRECT_URL || "";
    Config.sentryDSN = process.env.SENTRY_DSN || "";
    Config.tgBotId = process.env.TG_BOT_ID || "";
    Config.tgChatId = process.env.TG_CHAT_ID || "";
    Config.GDFProjectId = process.env.GDF_PROJECT_ID || "";
    Config.GDFLocation = process.env.GDF_LOCATION || "";
    Config.GDFAgentId = process.env.GDF_AGENT_ID || "";
    Config.GDFLanguageCode = process.env.GDF_LANGIAGE_CODE || "";
  }

  static getGCP() {
    const gcp = process.env.GOOGLE_CP;
    const tempDir = __dirname + "/tmp";


    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { mode: 0o0744, recursive: true});
    }

    const filename = tempDir + "/google.json";
    fs.writeFileSync(filename, gcp || "");
    console.log(fs.readdirSync(filename))
    process.env.GOOGLE_APPLICATION_CREDENTIALS = filename;
  }

  static async validate(): Promise<void> {
    console.log("Loading configuration...");
    Config.init();
    console.log(Config);
    const errors = await validate(Config);
    if (errors.length > 0)
      throw new Error(`Configuration problems: ${errors.join("\n")}`);
  }
}

Config.init();
Config.getGCP();

export default Config;
