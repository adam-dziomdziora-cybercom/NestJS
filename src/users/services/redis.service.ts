import { Injectable } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

@Injectable()
export class RedisService {
  public client: Redis;
  constructor(host: string, port: number, password?: string, ssl?: boolean) {
    const option: RedisOptions = {
      host,
      port,
      password: ssl ? password : undefined,
      tls: ssl ? { servername: host } : undefined,
    };
    console.log(option);
    // this.client = new Redis(option);
    // this.client.on('error', (err) => {
    //   console.error('Redis Client Error', err);
    // });
  }
}
