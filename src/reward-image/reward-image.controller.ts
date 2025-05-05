import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Param,
  Patch,
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
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('AI Reward')
@Controller('reward')
export class RewardImageController {
  constructor(private readonly rewardService: RewardImageService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI 답례 저장 (이미지+일기+스타일)' })
  @ApiBody({ type: SaveRewardImageDto })
  @ApiResponse({ status: 201, description: 'AI 답례 저장 성공' })
  @ApiResponse({ status: 400, description: '요청 데이터 오류' })
  async saveReward(@Req() req: Request, @Body() body: SaveRewardImageDto) {
    return this.rewardService.saveRewardImage(req.user!.uid, body);
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI 답례 보관함 전체 조회' })
  @ApiResponse({ status: 200, description: '전체 AI 답례 반환 성공' })
  async getHistory(@Req() req: Request) {
    return this.rewardService.getRewardHistory(req.user!.uid);
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
  async getLikedRewards(@Req() req: Request) {
    return this.rewardService.getLikedRewards(req.user!.uid);
  }
}
