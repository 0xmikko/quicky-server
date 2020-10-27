/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { Request } from "express";
import { verify } from "jsonwebtoken";
import config from "../config";
import { tokenData } from "../payload/userPayload";

export interface Context {
  user?: tokenData;
}

export async function authUserContext({req}: {req: Request}): Promise<Context> {
  // here you can use request/response objects from action
  // you need to provide a user object that will be injected in controller actions
  // demo code:
  if (req.headers?.authorization?.split(" ")[0] === "Bearer") {
    const token = req.headers.authorization.split(" ")[1];
    const tokenData = verify(token, config.jwt_secret) as tokenData;
    return { user: tokenData };
  } // we specify controllers we want to use
  return { user: undefined };
}
