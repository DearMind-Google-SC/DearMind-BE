import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EmotionComboIconService } from './emotion-combo-icon.service';
import { EmotionType } from '../selfcare/enums/emotion-type.enum';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Emotion Combo Icon')
@Controller('emotion-combo-icon')
export class EmotionComboIconController {
  constructor(private readonly comboService: EmotionComboIconService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '복합 감정 조합 이미지 반환' })
  @ApiQuery({
    name: 'emotions',
    required: true,
    isArray: true,
    enum: EmotionType,
    description: '감정 타입 리스트 (HAPPY, GLOOMY, ANGRY, ANXIOUS 중 최대 4개)',
  })
  @ApiResponse({ status: 200, description: '조합 이미지 반환 성공' })
  @ApiResponse({ status: 404, description: '해당 조합 이미지 없음' })
  async getComboIcon(@Query('emotions') emotions: EmotionType[]) {
    return this.comboService.getCombinationIcon(emotions);
  }
}