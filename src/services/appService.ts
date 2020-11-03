/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import { Inject, Service } from "typedi";
import { AppRepository } from "../repository/appRepository";
import { UserRepository } from "../repository/userRepository";
import { SocketPusherDelegate } from "../core/socket";
import { App } from "../core/app";
import { QuickbaseRepository } from "../repository/quickbaseRepository";
import { ContactEntity } from "../entities/contactEntity";
import { SettingsEntity } from "../entities/settingsEntity";
import { AppEntity, EntityType } from "../core/appEntity";
import { ProjectEntity } from "../entities/projectEntity";

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
    const appId = "bqyg6th9t";
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

  async addEntity(userId: string, entityName: string, entityType: EntityType) {
    let app = await this._repository.findByUser(userId);
    if (app === null) throw new Error("App not found");

    // For new applications add new Setting entity
    if (app.entities.length === 0) {
      const settingsEntity = new SettingsEntity();
      app.entities.push(settingsEntity);
    }

    let entity: AppEntity;

    switch (entityType) {
      case "Contact":
        entity = new ContactEntity();
        entity.name = entityName;
        break;
      case "Project":
        entity = new ProjectEntity();
        entity.name = entityName;
        break;
      default:
        throw new Error("Unknown entity");
    }

    console.log(app);
    entity.order = app.entities.length;
    app.entities.push(entity);
    console.log(app);
    await this._repository.save(app);
    this._pusher.pushUpdateQueue({
      userId,
      event: "app:updateDetails",
      handler: async () => app
    });
  }

  async deployApp(userId: string) {
    let app = await this._repository.findByUser(userId);
    if (app === null) throw new Error("App not found");

    const updatedEntities: AppEntity[] = [];
    for (let entity of app.entities) {
      if (entity.type !== 'Contact') continue;
      const updEntity = await this.deployEntity(userId, entity);
      console.log(updEntity)
      updatedEntities.push(updEntity);
    }
    app.entities = updatedEntities;
    await this._repository.save(app);
  }

  async deployEntity(userId: string, entity: AppEntity) {
    const qbToken = await this._userRepository.getQBTokenElseThrow(userId);
    console.log(qbToken);
    const appId = "bqyg6th9t";
    const hostName = "hackathon20-mlazarev.quickbase.com";

    const tableId = await this._qbRepository.createTableFromEntity(
      appId,
      hostName,
      qbToken,
      entity
    );

    entity.tableId = tableId;
    console.log("NEW TABLE WAS CREATED", tableId);

    if (entity.dataMapper === null || entity.dataMapper === undefined)
      return entity;

    // Adding fields
    for (let e of Object.entries(entity.dataMapper)) {
      const key = e[0];
      const field = e[1];
      const fieldId = await this._qbRepository.createFieldAtTable(
        tableId,
        hostName,
        qbToken,
        field
      );
      field.id = fieldId;
      entity.dataMapper[key] = field;
    }

    return entity;
  }
}
