import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppServiceBase } from './app.service.base';
import entities from './typeorm/entities';
import { UsersModule } from './users/users.module';
import * as env from 'env-var';
import { RedisService } from './users/services/redis.service';
import 'dotenv/config'; // this is needed to load .env file

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: env.get('DB_PORT').required().asPortNumber(),
        username: env.get('DB_USERNAME').required().asString(),
        password: env.get('DB_PASSWORD').required().asString(),
        database: env.get('DB_NAME').required().asString(),
        entities: entities,
        synchronize: true,
        ssl: env.get('DB_SSL').required().asBool(),
        extra: {
          ssl: {
            rejectUnauthorized: false,
          },
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: AppServiceBase, useClass: AppService },
    {
      provide: RedisService,
      useFactory: () =>
        new RedisService(
          env.get('REDIS_HOST').required().asString(),
          env.get('REDIS_PORT').required().asPortNumber(),
          env.get('REDIS_PASSWORD').asString(),
          env.get('REDIS_SSL').required().asBool(),
        ),
    },
  ],
})
export class AppModule {}
