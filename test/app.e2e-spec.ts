import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from './../src/app.module';
import { INestApplication } from '@nestjs/common';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

describe('AppController (e2e)', () => {
  jest.setTimeout(50000);
  let app: INestApplication;
  let containerRedis: StartedTestContainer;

  beforeAll(async () => {
    // "redis" is the name of the Docker imaage to download and run
    containerRedis = await new GenericContainer('redis')
      // exposes the internal Docker port to the host machine
      .withExposedPorts(6379)
      .start();
    const host = containerRedis.getHost();
    const port = containerRedis.getMappedPort(6379);
    process.env.REDIS_HOST = host;
    process.env.REDIS_PORT = port.toString();
    process.env.REDIS_SSL = 'false';
    process.env.REDIS_PASSWORD = '';
    process.env.DB_PORT = '5432';
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
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
    app.close();
    await containerRedis.stop();
  });
});
