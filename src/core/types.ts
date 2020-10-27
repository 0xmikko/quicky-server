
/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { ObjectId } from "mongodb";

export type Ref<T> = T | ObjectId;

export class Queue<T> {
    _store: T[] = [];
    push(val: T) {
        this._store.push(val);
    }
    pop(): T | undefined {
        return this._store.shift();
    }
}
