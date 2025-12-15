import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerModule } from 'nestjs-pino';
import * as Joi from 'joi';
import { FacebookModule } from './facebook/facebook.module';
import { WorkerModule } from './worker/worker.module';
import { SlackModule } from './slack/slack.module';
import { RawBodyMiddleware } from './common/middleware/raw-body.middleware';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) =>
          req.headers['x-correlation-id'] || crypto.randomUUID(),
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        FACEBOOK_APP_SECRET: Joi.string().required(),
        FACEBOOK_VERIFY_TOKEN: Joi.string().required(),
        SLACK_BOT_TOKEN: Joi.string().required(),
        SLACK_CHANNEL_ID: Joi.string().required(),
        KAFKA_BROKERS: Joi.string().default('localhost:9093'),
        MONGO_URI: Joi.string().required(),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    FacebookModule,
    WorkerModule,
    SlackModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({ path: 'webhook', method: RequestMethod.POST });
  }
}
