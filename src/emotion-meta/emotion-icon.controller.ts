import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import { EmotionIconService } from './emotion-icon.service';
import { AuthGuard } from '../auth/auth.guard';
import { EmotionType } from '../selfcare/enums/emotion-type.enum';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';

@ApiTags('Emotion Icon')
@Controller('emotion-icon')
export class EmotionIconController {
  constructor(private readonly iconService: EmotionIconService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '감정 타입으로 캐릭터 이미지 조회 (유효하지 않거나 없으면 UNKNOWN 반환)',
  })
  @ApiQuery({
    name: 'emotion',
    required: false,
    enum: [...Object.values(EmotionType), 'UNKNOWN'],
    description: '감정 유형 (예: HAPPY, GLOOMY, ANGRY, ANXIOUS, UNKNOWN)',
  })
  @ApiResponse({ status: 200, description: '감정 타입 기반 이미지 반환 성공' })
  @ApiResponse({ status: 404, description: '해당 감정 이미지 없음' })
  async getIconByEmotion(@Query('emotion') emotion?: EmotionType | 'UNKNOWN') {
    const resolved = emotion ?? 'UNKNOWN';
    return this.iconService.getIconByEmotion(resolved);
  }

  @Get('today')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '오늘 감정 기록 중 가장 최근 감정 캐릭터 이미지 조회 (없으면 UNKNOWN)',
  })
  @ApiResponse({
    status: 200,
    description: '오늘 가장 최근 감정 기반 이미지 반환 성공',
  })
  @ApiResponse({
    status: 404,
    description: '감정 이미지가 존재하지 않음',
  })
  async getTodayIcon(@Req() req: Request) {
    return this.iconService.getIconForToday(req.user!.uid);
  }
}
