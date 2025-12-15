import { IsArray, IsString, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class FacebookUser {
  @IsString()
  id: string;
}

class FacebookMessage {
  @IsString()
  mid: string;

  @IsString()
  text: string;
}

class FacebookMessaging {
  @ValidateNested()
  @Type(() => FacebookUser)
  sender: FacebookUser;

  @ValidateNested()
  @Type(() => FacebookUser)
  recipient: FacebookUser;

  @IsNumber()
  timestamp: number;

  @ValidateNested()
  @Type(() => FacebookMessage)
  message: FacebookMessage;
}

class FacebookEntry {
  @IsString()
  id: string;

  @IsNumber()
  time: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacebookMessaging)
  messaging: FacebookMessaging[];
}

export class FacebookWebhookDto {
  @IsString()
  object: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FacebookEntry)
  entry: FacebookEntry[];
}
