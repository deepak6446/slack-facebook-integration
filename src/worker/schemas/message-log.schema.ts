import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MessageStatus, MessageSource } from '../../common/types';

export type MessageLogDocument = MessageLog & Document;

@Schema()
export class MessageLog {
  @Prop({ required: true, enum: MessageSource })
  source: string;

  @Prop({ required: true, unique: true }) // Unique index for idempotency
  mid: string;

  @Prop({ type: Object, required: true })
  payload: any;

  @Prop({
    required: true,
    enum: MessageStatus,
    default: MessageStatus.RECEIVED,
  })
  status: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const MessageLogSchema = SchemaFactory.createForClass(MessageLog);
