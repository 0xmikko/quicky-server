/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import {AppEntity} from "../core/appEntity";

export class SettingsEntity extends AppEntity {

    constructor() {
        super();
        this.icon = 'ios-cog';
        this.name = "Settings";
        this.template = "Settings";
        this.order = 1000;
    }

    deploy(): Promise<void> {
        return Promise.resolve(undefined);
    }


}
