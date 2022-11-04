import { Injectable } from '@nestjs/common';
import { IRedisSecret } from './keyvault.service';
import { KeyVaultServiceBase } from './keyvault.service.base';
@Injectable()
export class KeyVaultServiceFacade extends KeyVaultServiceBase {
  initClient(): Promise<IRedisSecret> {
    return Promise.resolve({ ca: null, key: null, cert: null });
  }
}
