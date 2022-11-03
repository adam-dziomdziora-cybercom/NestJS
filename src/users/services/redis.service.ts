import { Injectable } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import * as fs from 'fs';
@Injectable()
export class RedisService {
  public client: Redis;
  constructor(host: string, port: number, password?: string, ssl?: boolean) {
    const ca = fs.readFileSync('ca.crt'); //TODO: move to the key vault
    const cert = fs.readFileSync('redis.crt');
    const key = fs.readFileSync('redis.key');
    debugger;
    const option: RedisOptions = {
      host,
      port,
      password: ssl ? password : undefined,
      tls: ssl
        ? {
            rejectUnauthorized: false,
            ca,
            cert,
            key,
          }
        : undefined,
    };
    this.client = new Redis(option);
    this.client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
  }
}
