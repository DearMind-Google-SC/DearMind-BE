import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Param,
  Patch,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { RewardImageService } from './reward-image.service';
import { AuthGuard } from '../auth/auth.guard';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RewardStyle } from './enums/reward-style.enum';

@ApiTags('AI Reward')
@Controller('reward')
export class RewardImageController {
  constructor(private readonly rewardService: RewardImageService) {}

  @Post('generate')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI 답례 생성, 저장 및 반환' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        style: { type: 'string', enum: Object.values(RewardStyle) },
        images: { type: 'array', items: { type: 'string' } },
        diaries: { type: 'array', items: { type: 'string' } },
        streak: { type: 'integer', example: 3 },
      },
      required: ['style', 'images', 'diaries', 'streak'],
    },
  })
  @ApiResponse({ status: 201, description: 'AI 답례 생성 및 저장 성공' })
  @ApiResponse({ status: 500, description: 'AI 생성 실패 또는 저장 실패' })
  async generateReward(
    @Req() req: Request,
    @Body() body: { style: RewardStyle; images: string[]; diaries: string[]; streak: number },
  ) {
    return this.rewardService.generateAndSaveReward(
      req.user!.uid,
      body.style,
      body.images,
      body.diaries,
      body.streak,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI 답례 보관함 전체 조회 (최신순)' })
  @ApiResponse({ status: 200, description: '전체 AI 답례 반환 성공' })
  @ApiResponse({ status: 404, description: '보관함에 아무것도 없음' })
  async getHistory(@Req() req: Request) {
    return this.rewardService.getRewardHistory(req.user!.uid);
  }

  @Get('monthly')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '월별 AI 답례 리스트 조회 (최신순)' })
  @ApiQuery({ name: 'year', required: true, example: 2025 })
  @ApiQuery({ name: 'month', required: true, example: 4 })
  @ApiResponse({ status: 200, description: '월별 AI 답례 반환 성공' })
  @ApiResponse({ status: 400, description: 'year 또는 month가 누락됨' })
  async getMonthlyRewardHistory(
    @Req() req: Request,
    @Query('year') year: number,
    @Query('month') month: number,
  ) {
    if (!year || !month) {
      throw new BadRequestException('year와 month를 모두 입력해야 합니다.');
    }
    return this.rewardService.getMonthlyRewardHistory(req.user!.uid, year, month);
  }

  @Get('style-samples')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI 답례 스타일 예시 이미지 조회' })
  @ApiResponse({ status: 200, description: '스타일 예시 이미지 조회 성공' })
  @ApiResponse({ status: 404, description: '예시 이미지가 존재하지 않음' })
  async getStyleSamples() {
    return this.rewardService.getStyleSamples();
  }

  @Patch(':rewardId/like')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI 답례 좋아요 토글' })
  @ApiParam({ name: 'rewardId', description: '좋아요 토글할 보상 ID' })
  @ApiResponse({ status: 200, description: '좋아요 토글 처리 성공' })
  @ApiResponse({ status: 404, description: '보상 없음' })
  async likeReward(@Req() req: Request, @Param('rewardId') rewardId: string) {
    return this.rewardService.likeReward(req.user!.uid, rewardId);
  }

  @Get('liked')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '좋아요한 AI 답례 목록 조회' })
  @ApiResponse({ status: 200, description: '좋아요한 답례 목록 반환 성공' })
  @ApiResponse({ status: 404, description: '좋아요한 항목 없음' })
  async getLikedRewards(@Req() req: Request) {
    return this.rewardService.getLikedRewards(req.user!.uid);
  }
}