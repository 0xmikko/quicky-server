/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

// Basic Interfaces
import {CreateQuery} from "mongoose";
import {DocumentType} from "@typegoose/typegoose";

export interface BasicRepositoryI<T> {

    insert(item: CreateQuery<DocumentType<T>>): Promise<T>
    findById(id : string) : Promise<T | null>
    list() : Promise<T[] | undefined>
    save(item: T) : Promise<T>
}

