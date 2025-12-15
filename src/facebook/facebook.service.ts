import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import * as crypto from 'crypto';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import { FacebookWebhookDto } from './dto/facebook-webhook.dto';
import { FacebookMessagePayload } from '../common/types';

@Injectable()
export class FacebookService {
  private readonly appSecret: string;

  constructor(
    private configService: ConfigService,
    @Inject('KAFKA_SERVICE') private kafkaClient: ClientKafka,
    @InjectPinoLogger(FacebookService.name) private readonly logger: PinoLogger,
  ) {
    this.appSecret = this.configService.get<string>('FACEBOOK_APP_SECRET')!;
  }

  verifySignature(signature: string, payload: Buffer): boolean {
    if (!signature) {
      this.logger.error('Signature validation failed: Missing signature');
      return false;
    }
    const [method, hash] = signature.split('=');
    if (method !== 'sha256') {
      this.logger.error('Signature validation failed: Unsupported method');
      return false;
    }
    const hmac = crypto.createHmac('sha256', this.appSecret);
    hmac.update(payload);
    const expectedHash = hmac.digest('hex');
    const isValid = hash === expectedHash;
    if (!isValid) {
      this.logger.error('Signature validation failed: Hash mismatch');
    }
    return isValid;
  }

  processEvent(event: FacebookWebhookDto) {
    this.logger.info('Processing Facebook event');
    for (const entry of event.entry) {
      for (const messaging of entry.messaging) {
        if (messaging.message && messaging.message.text) {
          const payload: FacebookMessagePayload = {
            senderId: messaging.sender.id,
            text: messaging.message.text,
            timestamp: messaging.timestamp,
            mid: messaging.message.mid, // Extract Message ID
          };
          this.logger.debug({ payload }, 'Emitting event to Kafka');
          this.kafkaClient.emit('fb-messages', payload);
        }
      }
    }
  }
}
