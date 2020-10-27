/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import "reflect-metadata";
import express, { Application } from "express";
import { Container } from "typedi";
import * as Sentry from "@sentry/node";
// import { authChecker, currentUserChecker } from "./middleware/authChecker";
// import { DefaultErrorHandler } from "./middleware/errorHandler";
// import { morganLogger } from "./middleware/morganLogger";
import config from "./config";

import { TgBot } from "./repository/tgRepository";
import { mongoose } from "@typegoose/typegoose";
import { AuthController } from "./controllers/authController";
import { ChatController } from "./controllers/chatController";
import { SocketRouter } from "./controllers/socketRouter";

export const createApp = async (): Promise<Application> => {
  //

  TgBot.init();
  // Connecting Database
  try {
    const startTime = Date.now();
    await mongoose.connect(config.database_url, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log("Connection time is: ", Date.now() - startTime, "ms");
  } catch (e) {
    console.log("MongoDB connection error: ", e);
    process.abort();
  }

  const app = express();

  if (process.env.NODE_ENV !== "development") {
    Sentry.init({
      dsn: config.sentryDSN,
      integrations: [
        new Sentry.Integrations.OnUncaughtException(),
        new Sentry.Integrations.OnUnhandledRejection()
      ]
    });
    // The request handler must be the first middleware on the app
    app.use(Sentry.Handlers.requestHandler());
    // The error handler must be before any other error middleware
    app.use(Sentry.Handlers.errorHandler());
  }
  let server = require("http").Server(app);

  const authController = Container.get(AuthController);
  authController.apply(app);

  // set up socket.io and bind it to our
  // http server.
  let io = require("socket.io").listen(server, {
    origins: "*:*",
    pingTimeout: 50000,
    pingInterval: 50000
  });

  try {
    const socketRouter = new SocketRouter([ChatController]);
    socketRouter.connect(io);
  } catch (e) {
    console.log("Cant start socket controllers", e);
  }

  return server;
};
