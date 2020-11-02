/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import {prop as Property} from "@typegoose/typegoose/lib/prop";
import {AppEntity} from "../core/appEntity";

export class ContactEntity extends AppEntity {
    @Property()
    firstName: string

    @Property()
    lastName: string

    @Property()
    email: string

    @Property()
    address: string

    @Property()
    phone: string

    @Property()
    mobile: string


    constructor() {
        super();
        this.icon = 'ios-person-circle';
        this.template = "Contact";
    }

    deploy(): Promise<void> {
        return Promise.resolve(undefined);
    }


}
