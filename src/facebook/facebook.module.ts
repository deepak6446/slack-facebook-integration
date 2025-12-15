import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FacebookService } from './facebook.service';
import { FacebookController } from './facebook.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'KAFKA_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              brokers: [
                configService.get<string>('KAFKA_BROKERS') || 'localhost:9093',
              ],
            },
            consumer: {
              groupId: 'facebook-producer-group',
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
    ConfigModule,
  ],
  providers: [FacebookService],
  controllers: [FacebookController],
})
export class FacebookModule {}
