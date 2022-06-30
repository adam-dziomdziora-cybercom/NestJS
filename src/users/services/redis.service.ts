import { Injectable } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService {
  public client: Redis;
  constructor(host: string, port: number) {
    const option: RedisOptions = { host, port };
    this.client = new Redis(option);
    this.client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
  }
}
