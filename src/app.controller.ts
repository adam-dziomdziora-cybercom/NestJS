import { Controller, Get } from '@nestjs/common';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as moment from 'moment';
import { AppServiceBase } from './app.service.base';
import { IName } from './names.entity';
import { RedisService } from './users/services/redis.service';

@Controller()
export class AppController implements OnModuleInit, OnModuleDestroy {
  readonly key = 'AppController-onModuleInit-date';
  constructor(
    private readonly appService: AppServiceBase,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit(): Promise<void> {
    const date = moment().format('llll'); // Tue, Jun 21, 2022 10:25 AM
    await this.redisService.client.set(this.key, date);
    await this.appService.prepareDatabase();
  }

  onModuleDestroy(): void {
    this.redisService.client.disconnect();
    this.appService.disposeDbConnection();
  }

  @Get()
  async getHello(): Promise<string> {
    return `${this.appService.getHello()}`;
  }

  @Get('/startDate')
  async getStartDate(): Promise<string> {
    const date = await this.redisService.client.get(this.key);
    return `App started at ${date}`;
  }

  @Get('/namesMale')
  async getNamesMale(): Promise<string[]> {
    const params: IName = { isMale: true };
    return await this.appService.queryContainer(params);
  }

  @Get('/namesFemale')
  async getNamesFemale(): Promise<string[]> {
    const params: IName = { isFemale: true };
    return await this.appService.queryContainer(params);
  }

  @Get('/lastNames')
  async getNames(): Promise<string[]> {
    const params: IName = { isLastName: true };
    return await this.appService.queryContainer(params);
  }
}
