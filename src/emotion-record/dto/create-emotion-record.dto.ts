import { IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmotionRecordDto {
  @ApiProperty({ description: 'base64로 인코딩된 이미지', example: 'data:image/png;base64,...' })
  @IsString()
  image: string;

  @ApiProperty({ description: '텍스트 일기 (선택)', example: '오늘은 기분이 괜찮았어', required: false })
  @IsString()
  @MaxLength(300)
  text?: string;
}