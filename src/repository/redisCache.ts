/*
 * Copyright (c) 2020. Mikhail Lazarev
 */
import Redis from "ioredis";
import config from "../config";

export class RedisCache {
  protected static _redisClient: Redis.Redis;

  static get client(): Redis.Redis {
    if (RedisCache._redisClient === undefined) {
      RedisCache._redisClient = new Redis(config.redis_url);
    }
    return RedisCache._redisClient;
  }
}
