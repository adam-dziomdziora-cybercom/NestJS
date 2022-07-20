import { Injectable } from '@nestjs/common';
import { AppServiceBase } from './app.service.base';
import { IName } from './names.entity';

@Injectable()
export class AppServiceFacade extends AppServiceBase {
  getHello(): string {
    return 'Hello World!';
  }

  async prepareDatabase(): Promise<void> {
    return;
  }

  disposeDbConnection(): void {
    return;
  }

  queryContainer(params: IName): Promise<string[]> {
    return new Promise(() => {
      return `Hello World!${params}`;
    });
  }
}
