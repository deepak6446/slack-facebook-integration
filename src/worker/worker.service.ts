import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { MessageLog, MessageLogDocument } from './schemas/message-log.schema';
import { SlackService } from '../slack/slack.service';
import {
  MessageStatus,
  MessageSource,
  FacebookMessagePayload,
} from '../common/types';

@Injectable()
export class WorkerService {
  constructor(
    @InjectModel(MessageLog.name)
    private messageLogModel: Model<MessageLogDocument>,
    private slackService: SlackService,
    @InjectPinoLogger(WorkerService.name) private readonly logger: PinoLogger,
  ) {}

  async handleFacebookMessage(payload: FacebookMessagePayload) {
    this.logger.info({ payload }, 'Received message from Kafka');

    // Idempotency Check
    if (payload.mid) {
      const existingLog = await this.messageLogModel.findOne({
        mid: payload.mid,
      });
      if (existingLog) {
        this.logger.warn(
          { mid: payload.mid },
          'Message already processed, skipping.',
        );
        return;
      }
    }

    // Save to MongoDB
    const log = new this.messageLogModel({
      source: MessageSource.FACEBOOK,
      mid: payload.mid || `generated-${Date.now()}`, // Fallback if mid missing
      payload: payload,
      status: MessageStatus.RECEIVED,
    });
    await log.save();

    // Send to Slack
    try {
      await this.slackService.sendNotification(payload.text, payload.senderId);

      // Update status
      log.status = MessageStatus.PROCESSED;
      await log.save();
      this.logger.info('Message processed and sent to Slack');
    } catch (error) {
      log.status = MessageStatus.FAILED;
      await log.save();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.logger.error({ err: error }, 'Failed to process message');
    }
  }
}
