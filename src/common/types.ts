export enum MessageStatus {
  RECEIVED = 'received',
  PROCESSED = 'processed',
  FAILED = 'failed',
}

export enum MessageSource {
  FACEBOOK = 'facebook',
}

export interface FacebookMessagePayload {
  senderId: string;
  text: string;
  timestamp: number;
  mid?: string; // Facebook Message ID for idempotency
}
