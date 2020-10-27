/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {ObjectType} from "typedi";
import {BasicRepositoryI} from "./basicRepository";
import {DocumentType, getModelForClass} from "@typegoose/typegoose";
import {ReturnModelType} from "@typegoose/typegoose/lib/types";
import {CreateQuery, Document} from "mongoose";

export class MongoRepository<T extends Document>
  implements BasicRepositoryI<T> {
  private readonly _modelClass: ObjectType<T>;
  protected readonly _model: ReturnModelType<ObjectType<T>, {}>;
  // protected readonly _cache: Redis

  constructor(model: ObjectType<T>) {
    this._model = getModelForClass(model);
    this._modelClass = model;
  }

  async findById(id: string): Promise<T | null> {
    return this._model.findById(id, {}).exec();
  }

  async list(): Promise<T[]> {
    return this._model.find({}).exec();
  }

  async insert(item: CreateQuery<DocumentType<T>>): Promise<T> {
      return await this._model.create(item);

  }

  async save(item: T): Promise<T> {
      await item.save()
      return item;
    // return getManager()
    //   .getRepository<T>(this._entityClass)
    //   .save(item);
  }

  // update(item : T, id: string) {
  //     return getManager().getRepository<T>(this.tableName).update(item, )
  // }
}
