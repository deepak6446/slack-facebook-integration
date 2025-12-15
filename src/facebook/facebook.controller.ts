import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  Headers,
  HttpException,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FacebookService } from './facebook.service';
import { FacebookWebhookDto } from './dto/facebook-webhook.dto';
import { Request } from 'express';

@Controller('webhook')
export class FacebookController {
  constructor(
    private readonly facebookService: FacebookService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ) {
    const verifyToken = this.configService.get<string>('FACEBOOK_VERIFY_TOKEN');
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }

  @Post()
  handleWebhook(
    @Headers('x-hub-signature-256') signature: string,
    @Body() body: FacebookWebhookDto,
    @Req() req: any,
  ) {
    // Use the raw body captured by the middleware

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const payload = req.rawBody;

    if (!payload) {
      throw new HttpException(
        'Missing raw body',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (!this.facebookService.verifySignature(signature, payload)) {
      // throw new HttpException('Invalid signature', HttpStatus.FORBIDDEN);
    }

    this.facebookService.processEvent(body);
    return 'EVENT_RECEIVED';
  }
}
