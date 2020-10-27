/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { Express, Request, Response } from "express";
import { Inject, Service } from "typedi";
import { transformAndValidate } from "class-transformer-validator";
import { AuthService } from "../services/authService";
import { CodeOAuthDTO } from "../payload/userPayload";

@Service()
export class AuthController {
  @Inject()
  private _service: AuthService;

  apply(app: Express) {
    app.get("/auth/google/login/", this.redirectGoogle);
    app.post("/auth/google/done/", this.loginGoogle);
  }

  redirectGoogle(req: Request, res: Response) {
    // this._logger.debug("Google login request");
    const url = this._service.getGoogleAuthRedirect();
    res.redirect(url);
  }

  async loginGoogle(req: Request, res: Response) {
    try {
      const codeRequest = await transformAndValidate(CodeOAuthDTO, req);
      console.log(codeRequest);

      const tokenPair = await this._service.loginGoogle(codeRequest);
      return tokenPair;
    } catch (e) {
      console.log(e);
    }
  }
}
