/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

export class EncryptHelper {
    static encrypt(raw: string | null) : string {
        console.log("ENCRYPTED")
        return raw || "";
    }

    static decrypt(encrypted: string | null) : string {

        console.log("DECRYPTED")
        return encrypted || "";
    }

}
