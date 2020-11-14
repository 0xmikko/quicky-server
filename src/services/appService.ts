/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import { Container, Inject, Service } from "typedi";
import { AppRepository } from "../repository/appRepository";
import { UserRepository } from "../repository/userRepository";
import { SocketPusherDelegate } from "../core/socket";
import { App } from "../core/app";
import { QuickbaseRepository } from "../repository/quickbaseRepository";
import { ContactEntity } from "../entities/contactEntity";
import { SettingsEntity } from "../entities/settingsEntity";
import { AppEntity, EntityType } from "../core/appEntity";
import { ProjectEntity } from "../entities/projectEntity";
import { allowedFields, Field, FieldType } from "../core/field";
import { QBCredentials } from "../payload/appPayload";
import { DialogFlowParams } from "../core/dialogFlow";

@Service()
export class AppService extends SocketPusherDelegate {
  @Inject()
  private _repository: AppRepository;

  @Inject()
  private _qbRepository: QuickbaseRepository;

  @Inject()
  private _userRepository: UserRepository;

  async connectApp(userId: string, url: string) {
    const qbCredentials = await this._userRepository.getQBTokenElseThrow(
      userId
    );

    const appId = "bqyg6th9t";
    const hostName = "hackathon20-mlazarev.quickbase.com";

    // Getting app
    const app = await this._qbRepository.getApp(appId, qbCredentials);
    app.qbHostName = hostName;

    // Creating / updating app in database
    await this._repository.upsert(app);

    const tables = await this._qbRepository.getTables(appId, qbCredentials);

    console.log(tables);

    for (let table of tables) {
      const fields = await this._qbRepository.getFields(
        table.id,
        qbCredentials
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
    app.splashTitle = "Quicky";
    app.splashSubtitle = "AI app builder";
    app.splashTitleColor = "white";
    app.splashSubtitleColor = "white";
    app.splashBackground = "#763e9a";

    app.owner = userId;

    return await this._repository.insert(app);
  }

  // update a property for current app
  async updateProperty(userId: string, params: DialogFlowParams) {
    let app = await this._repository.findByUser(userId);
    if (app === null) throw new Error("App not found");

    app.updateWithDFParams(params);

    await this._repository.save(app);
    this._updateApp(userId, app);
  }

  async addEntity(userId: string, entityName: string, entityType: EntityType) {
    let app = await this._repository.findByUser(userId);
    if (app === null) throw new Error("App not found");

    // For new applications add new Setting entity
    if (app.entities.length === 0) {
      console.log("Adding settong");
      const settingsEntity = new SettingsEntity();
      app.entities.push(settingsEntity);
    } else {
      if (app.entities.filter(e => e.name === entityName).length > 0) {
        throw new Error("Screen with this name is already exists!");
      }
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
    await this._repository.upsert(app);
    this._updateApp(userId, app);
  }

  async deployApp(userId: string) {
    let app = await this._repository.findByUser(userId);
    if (app === null) throw new Error("App not found");

    const qbCredentials = await this._userRepository.getQBTokenElseThrow(
      userId
    );

    if (app.qbAppId === undefined)
      throw new Error("QuickBase app id is not set!");
    console.log("QQB", app.qbAppId);

    const updatedEntities: AppEntity[] = [];
    for (let entity of app.entities) {
      if (entity.type !== "Contact") continue;
      let updEntity = await this.deployEntity(
        qbCredentials,
        app.qbAppId,
        entity
      );
      updEntity = await this.findIdField(qbCredentials, updEntity);
      updEntity.isDeployed = true;
      updatedEntities.push(updEntity);
    }
    app.entities = updatedEntities;

    await this._repository.upsert(app);
  }

  async deployEntity(
    qbCredentials: QBCredentials,
    appId: string,
    entity: AppEntity
  ) {
    const tableId = await this._qbRepository.createTableFromEntity(
      appId,
      entity,
      qbCredentials
    );

    entity.tableId = tableId;
    console.log("NEW TABLE WAS CREATED", tableId);

    if (entity.dataMapper === null || entity.dataMapper === undefined)
      return entity;

    // Adding fields
    for (let e of Object.entries(entity.dataMapper)) {
      const key = e[0];
      const field = e[1];
      if (field.fieldType === "recordid") continue;
      const fieldId = await this._qbRepository.createFieldAtTable(
        tableId,
        field,
        qbCredentials
      );
      field.id = fieldId;
      entity.dataMapper[key] = field;
    }

    return entity;
  }

  async findIdField(
    qbCredentials: QBCredentials,
    entity: AppEntity
  ): Promise<AppEntity> {
    const fields = await this._qbRepository.getFields(
      entity.tableId,
      qbCredentials
    );
    for (let field of fields) {
      console.log("Fie;d", field);
      if (field.fieldType === "recordid") {
        entity.dataMapper["id"] = new Field("id", "recordid");
        entity.dataMapper["id"].id = field.id;
      }
    }
    return entity;
  }

  // clears all info of current app
  async clearApp(userId: string) {
    let app = await this._repository.findByUser(userId);
    if (app !== null) {
      app.hidden = true;
      await this._repository.upsert(app);
    }
    const newApp = await this.retrieve(userId);
    this._updateApp(userId, newApp);
  }

  // add new screen to app
  async addNewScreen(
    userId: string,
    type: string,
    name: string
  ): Promise<void> {
    // case "entity":
    switch (type.toLowerCase()) {
      default:
      case "contacts":
        await this.addEntity(userId, name, "Contact");
        break;
      case "projects":
        await this.addEntity(userId, name, "Project");
        break;
    }
  }

  // add additional field to entity
  async addFieldToEntity(
    userId: string,
    currentScreen: string,
    fieldName: string,
    fieldType: string
  ) {
    if (!allowedFields.includes(fieldType))
      throw new Error("Field type is not supported");

    let app = await this._repository.findByUser(userId);
    if (app === null) throw new Error("App not found");

    app.entities = app.entities.map(entity => {
      if (entity.name === currentScreen) {
        entity.dataMapper[fieldName] = new Field(
          fieldName,
          fieldType as FieldType
        );
        entity.additionalFields = [...entity.additionalFields, fieldName];
      }
      return entity;
    });
    await this._repository.upsert(app);
    this._updateApp(userId, app);
  }


  // Return list of screen names of app for current user
  async listScreens(userId: string): Promise<string[]> {
    let app = await this._repository.findByUser(userId);
    if (app === null) throw new Error("App not found");
    return app.entities.map(e => e.name);
  }

  // Delete screen with particular name in app found by userId
  async deleteScreen(userId: string, name: string) {
    let app = await this._repository.findByUser(userId);
    if (app === null) throw new Error("App not found");
    app.entities = app.entities.filter(ent => ent.name !== name);
    await this._repository.upsert(app);
    this._updateApp(userId, app);
  }

  async switchToScreen(userId: string, current_screen: string) {
    let app = await this._repository.findByUser(userId);
    if (app === null) throw new Error("App not found");
    const screenType = app.entities.filter(ent => ent.name === current_screen);
    if (screenType.length === 0) throw new Error("Screen not found");

    this._pusher.pushUpdateQueue({
      userId,
      event: "app:switchToScreen",
      handler: async () => screenType[0].type
    });
  }


  // Update mobile state using websocket
  protected _updateApp(userId: string, app: App) {
    this._pusher.pushUpdateQueue({
      userId,
      event: "app:updateDetails",
      handler: async () => app
    });
  }
}
