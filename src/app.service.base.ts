import { Injectable } from '@nestjs/common';
import { IName } from './names.entity';

@Injectable()
export abstract class AppServiceBase {
  abstract getHello(): string;
  abstract prepareDatabase(): Promise<void>;
  abstract disposeDbConnection(): void;
  abstract queryContainer(params: IName): Promise<string[]>;
}
