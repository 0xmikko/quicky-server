/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import { Inject, Service } from "typedi";
import { AppRepository } from "../repository/appRepository";
import { UserRepository } from "../repository/userRepository";
import { SocketPusher, SocketPusherDelegate } from "../core/socket";
import { App } from "../core/app";
import { QuickbaseRepository } from "../repository/quickbaseRepository";
import { AppEntity } from "../core/appEntity";

@Service()
export class AppService extends SocketPusherDelegate {
  @Inject()
  private _repository: AppRepository;

  @Inject()
  private _qbRepository: QuickbaseRepository;

  @Inject()
  private _userRepository: UserRepository;

  async connectApp(userId: string, url: string) {
    const qbToken = await this._userRepository.getQBTokenElseThrow(userId);
    console.log(qbToken);
    const appId = "bqxwp8kss";
    const hostName = "hackathon20-mlazarev.quickbase.com";

    // Getting app
    const app = await this._qbRepository.getApp(appId, hostName, qbToken);
    app.qbHostName = hostName;

    // Creating / updating app in database
    await this._repository.upsert(app);

    const tables = await this._qbRepository.getTables(appId, hostName, qbToken);

    console.log(tables);

    for (let table of tables) {
      const fields = await this._qbRepository.getFields(
        table.id,
        hostName,
        qbToken
      );
      console.log(fields);
    }
  }

  async list(userId: string): Promise<App[]> {
    return await this._repository.listByUser(userId);
  }

  async retrieve(userId: string): Promise<App> {
    let app = await this._repository.findByUser(userId);
    if (app !== null) return app;

    app = new App();
    app.name = "New app";
    app.splashTitle = "Quick Base";
    app.splashSubtitle = "App builder";
    app.splashTitleColor = "green";
    app.splashSubtitleColor = "red";
    app.splashBackground = "grey";

    app.owner = userId;

    return await this._repository.insert(app);
  }

  async updateProperty(userId: string, property: string, newValue: string) {
    let app = await this._repository.findByUser(userId);
    if (app === null) throw new Error("App not found");
    //@ts-ignore
    app[property] = newValue;
    await this._repository.save(app);
    this._pusher.pushUpdateQueue({
      userId,
      event: "app:updateDetails",
      handler: async () => app
    });
  }

  async addEntity(userId: string, entityName: string, entityType: string) {
    let app = await this._repository.findByUser(userId);
    if (app === null) throw new Error("App not found");

    const entity = new AppEntity();
    entity.icon = "ios-home";
    entity.name = entityName
    entity.template = "Contact";

    console.log(app)
    app.entities.push(entity);
    console.log(app)
    await this._repository.save(app);
    this._pusher.pushUpdateQueue({
      userId,
      event: "app:updateDetails",
      handler: async () => app
    });
  }
}
