import { Injectable } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { KeyVaultServiceBase } from './keyvault.service.base';
@Injectable()
export class RedisService {
  public client: Redis;
  private redisOptions: RedisOptions;
  private keyvaultService: KeyVaultServiceBase;

  constructor(
    keyvaultService: KeyVaultServiceBase,
    host: string,
    port: number,
    password?: string,
    ssl?: boolean,
  ) {
    this.keyvaultService = keyvaultService;
    this.redisOptions = {
      host,
      port,
      password: ssl ? password : undefined,
    };
  }

  async initClient() {
    const { ca, key, cert } = await this.keyvaultService.initClient();

    this.redisOptions.tls = this.redisOptions.password
      ? {
          rejectUnauthorized: false,
          ca,
          key,
          cert,
        }
      : undefined;
    this.client = new Redis(this.redisOptions);
    this.client.on('error', (err) => {
      console.error('Redis Client Error', err);
    });
  }
}
