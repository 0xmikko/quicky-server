/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { Express, Request, Response } from "express";
import { Inject, Service } from "typedi";
import { transformAndValidate } from "class-transformer-validator";
import { AuthService } from "../services/authService";
import {CodeOAuthDTO, RefreshTokenReq} from "../payload/userPayload";

@Service()
export class AuthController {
  @Inject()
  private _service: AuthService;

  apply(app: Express) {
    app.get("/auth/google/login/", this.redirectGoogle.bind(this));
    app.post("/auth/google/done/", this.loginGoogle.bind(this));
    app.post("/auth/token/refresh/", this.refresh.bind(this));
    app.post("/auth/app/token/", this.loginWithToken.bind(this));
  }

  redirectGoogle(req: Request, res: Response) {
    // this._logger.debug("Google login request");
    const url = this._service.getGoogleAuthRedirect();
    res.redirect(url);
  }

  async loginGoogle(req: Request, res: Response) {
    try {
      const codeRequest = await transformAndValidate(
        CodeOAuthDTO,
        req.body as CodeOAuthDTO
      );
      console.log(codeRequest);

      const tokenPair = await this._service.loginGoogle(codeRequest);
      res.status(200).send(tokenPair);
    } catch (e) {
      console.log(e);
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const refreshTokenReq = await transformAndValidate(
          RefreshTokenReq,
          req.body as RefreshTokenReq
      );

      const tokenPair = await this._service.refresh(refreshTokenReq);
      res.send(tokenPair);
    } catch (e) {
      console.log(e);
    }
  }

  async loginWithToken(req: Request, res: Response) {
    try {
      const codeRequest = await transformAndValidate(
          CodeOAuthDTO,
          req.body as CodeOAuthDTO
      );
      console.log(codeRequest);

      const tokenPair = await this._service.loginWithToken(codeRequest);
      res.status(200).send(tokenPair);
    } catch (e) {
      console.log(e);
    }
  }

}
