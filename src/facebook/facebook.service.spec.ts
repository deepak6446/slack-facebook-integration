import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { getLoggerToken } from 'nestjs-pino';
import { FacebookService } from './facebook.service';
import * as crypto from 'crypto';

describe('FacebookService', () => {
  let service: FacebookService;
  let kafkaClient: ClientKafka;

  const mockAppSecret = 'test_app_secret';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FacebookService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'FACEBOOK_APP_SECRET') return mockAppSecret;
              return null;
            }),
          },
        },
        {
          provide: 'KAFKA_SERVICE',
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: getLoggerToken(FacebookService.name),
          useValue: {
            info: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FacebookService>(FacebookService);
    kafkaClient = module.get<ClientKafka>('KAFKA_SERVICE');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifySignature', () => {
    it('should return true for valid signature', () => {
      const payload = Buffer.from('test_payload');
      const hmac = crypto.createHmac('sha256', mockAppSecret);
      hmac.update(payload);
      const signature = `sha256=${hmac.digest('hex')}`;

      expect(service.verifySignature(signature, payload)).toBe(true);
    });

    it('should return false for invalid signature', () => {
      const payload = Buffer.from('test_payload');
      const signature = 'sha256=invalid_hash';

      expect(service.verifySignature(signature, payload)).toBe(false);
    });

    it('should return false for missing signature', () => {
      const payload = Buffer.from('test_payload');
      expect(service.verifySignature('', payload)).toBe(false);
    });
  });

  describe('processEvent', () => {
    it('should emit event to Kafka for valid message', () => {
      const event = {
        object: 'page',
        entry: [
          {
            id: '123',
            time: 1234567890,
            messaging: [
              {
                sender: { id: 'sender_1' },
                recipient: { id: 'recipient_1' },
                timestamp: 1234567890,
                message: {
                  mid: 'mid_1',
                  text: 'Hello World',
                },
              },
            ],
          },
        ],
      };

      service.processEvent(event);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(kafkaClient.emit).toHaveBeenCalledWith('fb-messages', {
        senderId: 'sender_1',
        text: 'Hello World',
        timestamp: 1234567890,
        mid: 'mid_1',
      });
    });
  });
});
