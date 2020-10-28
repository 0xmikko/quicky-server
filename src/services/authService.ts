/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {Inject, Service} from "typedi";
import {google} from "googleapis";
import {v4 as uuidv4} from "uuid";
import config from "../config";
import {User, UserModel} from "../core/user";
import jwt from "jsonwebtoken";
import {UserRepository} from "../repository/userRepository";
import {InvalidTokenError, UserNotFoundError} from "../errors/users";
import {UnknownInternalError} from "../errors/unknown";
import {CodeOAuthDTO, RefreshTokenReq, tokenData, TokenPair,} from "../payload/userPayload";
import {TgBot} from "../repository/tgRepository";

@Service()
export class AuthService {
  @Inject()
  private _repository: UserRepository;

  // @Inject()
  // _analyticsService: AnalyticsService;

  getGoogleAuthRedirect(): string {
    const oauth2Client = new google.auth.OAuth2(
      config.authGoogleClientID,
      config.authGoogleClientSecret,
      process.env.NODE_ENV === "development"
        ? config.authGoogleDevRedirectUrl
        : config.authGoogleProdRedirectUrl
    );

    console.log(oauth2Client);

    const scopes = [
      "openid",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ];

    const url = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: "offline",

      // If you only need one scope you can pass it as a string
      scope: scopes,
    });

    return url;
  }

  async loginGoogle(dto: CodeOAuthDTO): Promise<TokenPair> {
    return new Promise<TokenPair>(async (resolve, reject) => {
      const oauth2 = google.oauth2("v2");

      const oauth2Client = new google.auth.OAuth2(
        config.authGoogleClientID,
        config.authGoogleClientSecret,
        process.env.NODE_ENV === "development"
          ? config.authGoogleDevRedirectUrl
          : config.authGoogleProdRedirectUrl
      );
      try {
        const token = await oauth2Client.getToken(dto.code);

        oauth2Client.setCredentials(token.tokens);

        google.options({ auth: oauth2Client });

        // Do the magic
        const res = await oauth2.userinfo.v2.me.get({});

        if (!res.data.id || !res.data.email) throw UserNotFoundError;

        let user = await this._repository.findByEmail(res.data.email);
        if (user === null) {
          user = new User()
          user.email = res.data.email;
          user.name = res.data.name || "";
          user.family_name = res.data.family_name || "";
          user.given_name = res.data.given_name || "";
          user.avatar_url = res.data.picture || "";
          user.role = "user";
          // user.source = "google";
          user.googleId = res.data.id;

          // await UserModel.create(user);
          user = await this._repository.insert(user);
          // TgBot.sendNotification("New google login", user.email);
        }

        resolve(this.generateTokenPair(user.id, user.role));
        // if (dto.uid !== undefined) {
        //   await this._analyticsService.registerLogin(dto.uid, user, "GOOGLE");
        // }
      } catch (e) {
        console.log(e);
        reject(e);
      }
    });
  }

  async refresh(dto: RefreshTokenReq): Promise<TokenPair> {
    return new Promise<TokenPair>(async (resolve, reject) => {
      try {
        const data: tokenData = jwt.verify(
          dto.refresh,
          config.jwt_secret
        ) as tokenData;
        if (Date.now() > data.exp * 1000) throw InvalidTokenError;

        const user = await this._repository.findById(data.user_id);
        if (user === null) throw UserNotFoundError;

        resolve(this.generateTokenPair(data.user_id, user.role));
        // if (dto.uid !== undefined) {
        //   await this._analyticsService.registerLogin(dto.uid, user, "REFRESH");
        // }
      } catch (e) {
        if (e !== InvalidTokenError && e !== UserNotFoundError) {
          console.log(e);
          reject(UnknownInternalError);
        }
        reject(e);
      }
    });
  }

  private generateTokenPair(user_id: string, role: string): TokenPair {
    const HOUR = 3600; // Hour in seconds

    const accessExp = Date.now() / 1000 + 30 * HOUR;
    const accessData: tokenData = { user_id, role, exp: accessExp };
    const access = jwt.sign(accessData, config.jwt_secret);

    const refreshExp = Date.now() / 1000 + 530 * HOUR;
    const refreshData: tokenData = { user_id, role, exp: refreshExp };
    const refresh = jwt.sign(refreshData, config.jwt_secret);
    return {
      access,
      refresh,
    };
  }
}
