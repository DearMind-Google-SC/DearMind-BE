import { Controller, Get, UseGuards } from '@nestjs/common';
import { EmotionQuoteService } from './emotion-quote.service';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';
import {
  ApiBearerAuth, ApiOperation, ApiResponse, ApiTags,
} from '@nestjs/swagger';

@ApiTags('Emotion Quote')
@Controller('emotion-quote')
export class EmotionQuoteController {
  constructor(private readonly quoteService: EmotionQuoteService) {}

  @Get('today')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '오늘의 감정 명언 랜덤 조회' })
  @ApiResponse({ status: 200, description: '명언 조회 성공' })
  @ApiResponse({ status: 404, description: '명언 없음' })
  async getTodayQuote() {
    return this.quoteService.getRandomQuote();
  }
}
