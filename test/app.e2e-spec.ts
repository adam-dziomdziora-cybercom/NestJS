import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { RedisService } from '../src/users/services/redis.service';

describe('AppController (e2e)', () => {
  jest.setTimeout(50000);
  let app: INestApplication;
  let containerRedis: StartedTestContainer;
  let redisClient: RedisService;

  beforeAll(async () => {
    // "redis" is the name of the Docker imaage to download and run
    containerRedis = await new GenericContainer('redis')
      // exposes the internal Docker port to the host machine
      .withExposedPorts(6379)
      .start();
    const host = containerRedis.getHost();
    process.env.REDIS_HOST = host;
    const port = containerRedis.getMappedPort(6379);
    process.env.REDIS_PORT = port.toString();
    process.env.DB_PORT = '5432';
    redisClient = new RedisService(host, port);
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: RedisService,
          useFactory: () => redisClient,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  afterAll(async () => {
    redisClient.client.disconnect();
    await containerRedis.stop();
  });
});
