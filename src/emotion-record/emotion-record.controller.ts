import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    Get,
    Query,
  } from '@nestjs/common';
  import { Request } from 'express';
  import { EmotionRecordService } from './emotion-record.service';
  import { AuthGuard } from '../auth/auth.guard';
  import { CreateEmotionRecordDto } from './dto/create-emotion-record.dto';
  import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiQuery,
  } from '@nestjs/swagger';
  
  @ApiTags('Emotion Record')
  @Controller('diary')
  export class EmotionRecordController {
    constructor(private readonly emotionService: EmotionRecordService) {}
  
    @Post()
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '감정 기록 저장' })
    @ApiResponse({ status: 201, description: '감정 기록 저장 성공' })
    @ApiResponse({ status: 400, description: '잘못된 요청 데이터' })
    @ApiBody({ type: CreateEmotionRecordDto })
    async createRecord(@Req() req: Request, @Body() body: CreateEmotionRecordDto) {
      return this.emotionService.saveRecord(req.user!.uid, body);
    }
  
    @Get()
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '감정 기록 전체 조회 (최신순)' })
    @ApiResponse({ status: 200, description: '전체 감정기록 반환 성공' })
    @ApiResponse({ status: 404, description: '감정기록이 존재하지 않음' })
    async getAll(@Req() req: Request) {
      return this.emotionService.getAllRecords(req.user!.uid);
    }
  
    @Get('by-date')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '특정 날짜 감정 기록 조회' })
    @ApiQuery({ name: 'date', required: true, description: '조회할 날짜 (YYYY-MM-DD)', example: '2025-04-22' })
    @ApiResponse({ status: 200, description: '해당 날짜 감정기록 반환 성공' })
    @ApiResponse({ status: 404, description: '해당 날짜의 기록 없음' })
    async getByDate(@Req() req: Request, @Query('date') dateStr: string) {
      return this.emotionService.getRecordByDate(req.user!.uid, dateStr);
    }
  
    @Get('dates')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '감정 기록이 있는 날짜 목록 조회' })
    @ApiResponse({ status: 200, description: '날짜 목록 반환 성공' })
    @ApiResponse({ status: 404, description: '해당 유저의 감정 기록이 존재하지 않음' })
    async getDiaryDates(@Req() req: Request) {
      return this.emotionService.getRecordDates(req.user!.uid);
    }
  
    @Get('streak')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '연속 감정 기록 일 수 조회' })
    @ApiResponse({ status: 200, description: '연속 기록 일 수 반환 성공' })
    @ApiResponse({ status: 404, description: '사용자 정보가 존재하지 않음' })
    async getStreak(@Req() req: Request) {
      return this.emotionService.getStreak(req.user!.uid);
    }
  }
  