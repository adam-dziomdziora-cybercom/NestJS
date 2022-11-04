import { DefaultAzureCredential } from '@azure/identity';
import { KeyVaultSecret, SecretClient } from '@azure/keyvault-secrets';
import { Injectable } from '@nestjs/common';
import * as env from 'env-var';
import { KeyVaultServiceBase } from './keyvault.service.base';

export interface IRedisSecret {
  ca: Buffer;
  key: Buffer;
  cert: Buffer;
}

@Injectable()
export class KeyVaultService extends KeyVaultServiceBase {
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

  private getCertFromSecret(keyVaultSecret: KeyVaultSecret): Buffer {
    let certArr = keyVaultSecret.value.split(' ');
    if (certArr[0].startsWith('-----BEGIN')) {
      while (certArr[1] && certArr[0].lastIndexOf('CERTIFICATE-----') === -1) {
        certArr[0] = certArr[0] + ' ' + certArr[1];
        certArr = certArr.filter((_, idx) => idx !== 1);
      }

      while (certArr[certArr.length - 1].lastIndexOf('-----END') === -1) {
        certArr[certArr.length - 2] =
          certArr[certArr.length - 2] + ' ' + certArr[certArr.length - 1];
        certArr = certArr.filter((_, idx) => idx !== certArr.length - 1);
      }
    }

    return this.toBuffer(new TextEncoder().encode(certArr.join('\n')));
  }

  private getPrivateKeyFromSecret(keyVaultSecret: KeyVaultSecret): Buffer {
    let keyarr = keyVaultSecret.value.split(' ');
    if (keyarr[0].startsWith('-----BEGIN')) {
      while (keyarr[1] && keyarr[0].lastIndexOf('KEY-----') === -1) {
        keyarr[0] = keyarr[0] + ' ' + keyarr[1];
        keyarr = keyarr.filter((_, idx) => idx !== 1);
      }

      while (keyarr[keyarr.length - 1].lastIndexOf('-----END') === -1) {
        keyarr[keyarr.length - 2] =
          keyarr[keyarr.length - 2] + ' ' + keyarr[keyarr.length - 1];
        keyarr = keyarr.filter((_, idx) => idx !== keyarr.length - 1);
      }
    }

    return this.toBuffer(new TextEncoder().encode(keyarr.join('\n')));
  }

  private toBuffer(arrayBuffer: Uint8Array): Buffer {
    const buf = Buffer.alloc(arrayBuffer.byteLength);
    for (let i = 0; i < buf.length; ++i) {
      buf[i] = arrayBuffer[i];
    }
    return buf;
  }

  async initClient(): Promise<IRedisSecret> {
    const caSecret = await this.keyVaultClient.getSecret('casecret');
    const keySecret = await this.keyVaultClient.getSecret('rediskeysecret');
    const certSecret = await this.keyVaultClient.getSecret('rediscrtsecret');
    const ca = this.getCertFromSecret(caSecret);
    const cert = this.getCertFromSecret(certSecret);
    const key = this.getPrivateKeyFromSecret(keySecret);
    return { ca, cert, key };
  }
}
