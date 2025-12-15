import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WebClient } from '@slack/web-api';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import Bottleneck from 'bottleneck';

@Injectable()
export class SlackService {
  private readonly client: WebClient;
  private readonly channelId: string;
  private readonly limiter: Bottleneck;

  constructor(
    private configService: ConfigService,
    @InjectPinoLogger(SlackService.name) private readonly logger: PinoLogger,
  ) {
    const token = this.configService.get<string>('SLACK_BOT_TOKEN');
    this.channelId = this.configService.get<string>('SLACK_CHANNEL_ID')!;
    this.client = new WebClient(token);

    // Rate Limiter: 1 request per second (Slack allows ~1 msg/sec per channel)
    this.limiter = new Bottleneck({
      minTime: 1000,
      maxConcurrent: 1,
    });

    this.limiter.on('failed', (error, jobInfo) => {
      this.logger.warn(`Job ${jobInfo.options.id} failed: ${error}`);
      if (jobInfo.retryCount < 3) {
        // Retry up to 3 times
        return 1000; // Wait 1s before retry
      }
    });
  }

  async sendNotification(message: string, senderId: string) {
    return this.limiter.schedule(async () => {
      try {
        await this.client.chat.postMessage({
          channel: this.channelId,
          text: `New Message from Facebook User ${senderId}`, // Fallback text
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: 'New Message from Facebook',
                emoji: true,
              },
            },
            {
              type: 'section',
              fields: [
                {
                  type: 'mrkdwn',
                  text: `*Sender ID:*\n${senderId}`,
                },
                {
                  type: 'mrkdwn',
                  text: `*Time:*\n${new Date().toLocaleString()}`,
                },
              ],
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Message:*\n${message}`,
              },
            },
            {
              type: 'divider',
            },
          ],
        });
        this.logger.info(
          `Notification sent to Slack channel ${this.channelId}`,
        );
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.logger.error({ err: error }, 'Failed to send Slack notification');
        throw error;
      }
    });
  }
}
