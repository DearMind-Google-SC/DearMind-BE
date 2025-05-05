import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendChatDto {
  @ApiProperty({ example: '오늘 너무 우울해.' })
  @IsString()
  message: string;
}
