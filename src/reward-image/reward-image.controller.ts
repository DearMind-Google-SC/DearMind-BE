import {
    Controller,
    Post,
    Body,
    Get,
    UseGuards,
    Req,
  } from '@nestjs/common';
  import { Request } from 'express';
  import { RewardImageService } from './reward-image.service';
  import { SaveRewardImageDto } from './dto/save-reward-image.dto';
  import { AuthGuard } from '../auth/auth.guard';
  import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags,
  } from '@nestjs/swagger';
  
  @ApiTags('AI Reward')
  @Controller('reward')
  export class RewardImageController {
    constructor(private readonly rewardService: RewardImageService) {}
  
    @Post()
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'AI 답례 그림 이미지 + 텍스트 일기 저장 (3일 연속 기록 시)' })
    @ApiBody({ type: SaveRewardImageDto })
    @ApiResponse({ status: 201, description: 'AI 답례 그림 이미지 + 텍스트 일기 저장 성공' })
    @ApiResponse({ status: 400, description: '요청 데이터 오류' })
    async saveReward(@Req() req: Request, @Body() body: SaveRewardImageDto) {
      return this.rewardService.saveRewardImage(req.user!.uid, body);
    }
  
    @Get()
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'AI 답례 보관함 조회' })
    @ApiResponse({ status: 200, description: 'AI 답례 목록 반환 성공' })
    @ApiResponse({ status: 404, description: 'AI 답례 기록 없음' })
    async getHistory(@Req() req: Request) {
      return this.rewardService.getRewardHistory(req.user!.uid);
    }
  }
  