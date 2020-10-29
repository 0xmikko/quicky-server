/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import {ObjectType} from "type-graphql";
import {TimeStamps} from "@typegoose/typegoose/lib/defaultClasses";
import {modelOptions, prop as Property, Ref} from "@typegoose/typegoose";

@ObjectType()
export class Embedding extends TimeStamps {
    _id: string;

    @Property()
    appId: string

    @Property()
    tableId: string

    @Property()
    link: Map<string, number>


}
