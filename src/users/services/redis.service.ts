import { Injectable } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import {
  getCertFromSecret,
  getPrivateKeyFromSecret,
} from './key-vault.service';
import * as env from 'env-var';
@Injectable()
export class RedisService {
  public client: Redis;
  private readonly azureCredential = new DefaultAzureCredential();
  private readonly keyVaultName = env
    .get('KEY_VAULT_NAME2')
    .required()
    .asString();
  private readonly keyvaultUrl =
    'https://' + this.keyVaultName + '.vault.azure.net';

  private readonly keyVaultClient = new SecretClient(
    this.keyvaultUrl,
    this.azureCredential,
  );
  private redisOptions: RedisOptions;

  constructor(host: string, port: number, password?: string, ssl?: boolean) {
    this.redisOptions = {
      host,
      port,
      password: ssl ? password : undefined,
    };
  }

  async initClient() {
    const caSecret = await this.keyVaultClient.getSecret('casecret');
    const keySecret = await this.keyVaultClient.getSecret('rediskeysecret');
    const certSecret = await this.keyVaultClient.getSecret('rediscrtsecret');
    const ca = getCertFromSecret(caSecret);
    const cert = getCertFromSecret(certSecret);
    const key = getPrivateKeyFromSecret(keySecret);

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
