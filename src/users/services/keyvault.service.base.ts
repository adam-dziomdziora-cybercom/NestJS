import { Injectable } from '@nestjs/common';
import { IRedisSecret } from './keyvault.service';

@Injectable()
export abstract class KeyVaultServiceBase {
  abstract initClient(): Promise<IRedisSecret>;
}
