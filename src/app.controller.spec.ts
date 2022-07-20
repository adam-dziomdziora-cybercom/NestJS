import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppServiceBase } from './app.service.base';
import { AppServiceFacade } from './app.service.facade';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { RedisService } from './users/services/redis.service';
import * as moment from 'moment';

describe('AppController', () => {
  jest.setTimeout(50000);
  let app: TestingModule;
  let container: StartedTestContainer;
  let redisClient: RedisService;

  beforeAll(async () => {
    // "redis" is the name of the Docker imaage to download and run
    container = await new GenericContainer('redis')
      // exposes the internal Docker port to the host machine
      .withExposedPorts(6379)
      .start();
    const host = container.getHost();
    const port = container.getMappedPort(6379);
    redisClient = new RedisService(host, port);

    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        { provide: AppServiceBase, useClass: AppServiceFacade },
        {
          provide: RedisService,
          useFactory: () => redisClient,
        },
      ],
    }).compile();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', async () => {
      const appController = app.get<AppController>(AppController);
      const result = await appController.getHello();
      expect(result).toBe('Hello World!');
    });

    it('should return "Hello World! with date from Redis"', async () => {
      const appController = app.get<AppController>(AppController);
      const date = moment().format('ll'); // Jun 21, 2022
      await app.init();
      const result = await appController.getStartDate();
      expect(result).not.toBe('Hello World!, app started at: null');
      expect(result).toContain('App started at ');
      expect(result).toContain(date);
    });
  });

  afterAll(async () => {
    redisClient.client.disconnect();
    await container.stop();
  });
});
