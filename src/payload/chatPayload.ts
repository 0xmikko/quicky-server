/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {IsNotEmpty} from "class-validator";
import {Message} from "../core/message";

export class PostMessageDTO {
  @IsNotEmpty()
  text: string;

  toMessage() : Message {
    const message = new Message()
    message.text = this.text
    return message
  }
}
