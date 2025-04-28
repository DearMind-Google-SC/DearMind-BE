import { IsEnum } from 'class-validator';
import { EmotionType } from '../../selfcare/enums/emotion-type.enum';

export class UpdateEmotionTypeDto {
  @IsEnum(EmotionType, { message: 'emotionType은 HAPPY, GLOOMY, ANXIOUS, ANGRY 중 하나여야 합니다.' })
  emotionType: EmotionType;
}