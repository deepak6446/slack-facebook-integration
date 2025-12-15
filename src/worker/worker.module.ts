import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkerService } from './worker.service';
import { WorkerController } from './worker.controller';
import { MessageLog, MessageLogSchema } from './schemas/message-log.schema';
import { SlackModule } from '../slack/slack.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MessageLog.name, schema: MessageLogSchema },
    ]),
    SlackModule,
  ],
  controllers: [WorkerController],
  providers: [WorkerService],
})
export class WorkerModule {}
