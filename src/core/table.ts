/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {prop as Property} from "@typegoose/typegoose/lib/prop";
import {IsDateString, IsNotEmpty, IsString} from "class-validator";

export class Table {
    _id: string;

    @Property({unique: true, index: true})
    @IsNotEmpty()
    id: string;

    @Property()
    @IsNotEmpty()
    name: string;

    @Property()
    @IsNotEmpty()
    description: string;

    @Property()
    @IsNotEmpty()
    alias: string;

    @Property()
    @IsString()
    singleRecordName: string;

    @Property()
    @IsString()
    pluralRecordName: string;

    @Property()
    @IsDateString()
    created: Date;

    @Property()
    @IsDateString()
    updated: Date;


}
