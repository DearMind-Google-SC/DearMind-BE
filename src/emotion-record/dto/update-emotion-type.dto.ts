import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EmotionType } from '../../selfcare/enums/emotion-type.enum';

export class UpdateEmotionTypeDto {
  @ApiProperty({
    description: '감정 타입 (HAPPY, GLOOMY, ANGRY, ANXIOUS)',
    example: 'HAPPY',
    enum: EmotionType,
  })
  @IsEnum(EmotionType, {
    message: 'emotionType은 HAPPY, GLOOMY, ANXIOUS, ANGRY 중 하나여야 합니다.',
  })
  emotionType: EmotionType;
}
