import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendChatDto {
  @ApiProperty({
    description: '사용자 입력 메시지',
    example: '오늘 하루가 너무 힘들었어요.',
  })
  @IsString()
  message: string;
}