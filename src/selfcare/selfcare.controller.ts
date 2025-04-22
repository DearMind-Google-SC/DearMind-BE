import { Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { SelfcareService } from './selfcare.service';
import { AuthGuard } from '../auth/auth.guard';
import { EmotionType } from './enums/emotion-type.enum';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Selfcare')
@Controller('selfcare')
export class SelfcareController {
  constructor(private readonly selfcareService: SelfcareService) {}

  // 감정 기록 직후 → recommend()
  @Post('recommend')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '감정 분석 기반 셀프케어 활동 추천' })
  @ApiQuery({ name: 'emotion', enum: EmotionType, required: true })
  @ApiResponse({ status: 200, description: '감정 분석 기반 셀프케어 활동 추천 성공' })
  @ApiResponse({ status: 404, description: '해당 감정의 셀프케어 활동이 없음' })
  async recommend(
    @Req() req: Request,
    @Query('emotion') emotion: EmotionType,
  ) {
    return this.selfcareService.recommendSelfcare(req.user!.uid, emotion);
  }

  // 앱 재접속 후 하루 경과 → getLatest()
  @Get('latest')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '최근 셀프케어 활동 추천 조회' })
  @ApiResponse({ status: 200, description: '최근 추천 반환 성공' })
  @ApiResponse({ status: 404, description: '추천 기록이 존재하지 않음' })
  async getLatest(@Req() req: Request) {
    return this.selfcareService.getLatestRecommendation(req.user!.uid);
  }
}
