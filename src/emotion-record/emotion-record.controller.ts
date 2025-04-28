import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    Get,
    Query,
    Param,
    Patch,
    BadRequestException,
    Delete,
} from '@nestjs/common';
import { Request } from 'express';
import { EmotionRecordService } from './emotion-record.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateEmotionRecordDto } from './dto/create-emotion-record.dto';
import { UpdateEmotionTypeDto } from './dto/update-emotion-type.dto';
import {
    ApiBearerAuth,
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBody,
    ApiQuery,
    ApiParam,
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

    @Patch(':recordId/emotion-type')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '감정 타입 업데이트' })
    @ApiResponse({ status: 200, description: '감정 타입 업데이트 성공' })
    @ApiResponse({ status: 404, description: '해당 감정 기록 없음' })
    async updateEmotionType(
        @Req() req: Request,
        @Param('recordId') recordId: string,
        @Body() body: UpdateEmotionTypeDto,
    ) {
        return this.emotionService.updateEmotionType(req.user!.uid, recordId, body);
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

    @Get('emotion-types-by-date')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '특정 날짜 감정 타입 리스트 조회 (중복 제거)' })
    @ApiQuery({ name: 'date', required: true, description: '조회할 날짜 (YYYY-MM-DD)', example: '2025-04-22' })
    @ApiResponse({ status: 200, description: '특정 날짜 감정 타입 리스트 반환 성공' })
    @ApiResponse({ status: 400, description: '날짜 형식이 잘못되었거나 조회 실패' })
    async getEmotionTypesByDate(
        @Req() req: Request,
        @Query('date') dateStr: string,
    ) {
        if (!dateStr) {
            throw new BadRequestException('date 쿼리 파라미터를 입력해야 합니다.');
        }
        return this.emotionService.getEmotionTypesByDate(req.user!.uid, dateStr);
    }

    @Get('monthly-emotion-type-count')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '월별 감정 타입별 개수 조회 (개수 순 정렬)' })
    @ApiQuery({ name: 'year', required: true, description: '조회할 연도', example: 2025 })
    @ApiQuery({ name: 'month', required: true, description: '조회할 월 (1~12)', example: 4 })
    @ApiResponse({ status: 200, description: '월별 감정 타입별 개수 반환 성공' })
    @ApiResponse({ status: 400, description: 'year 또는 month 값이 유효하지 않음' })
    async getMonthlyEmotionTypeCount(
        @Req() req: Request,
        @Query('year') year: number,
        @Query('month') month: number,
    ) {
        if (!year || !month) {
            throw new BadRequestException('year와 month 쿼리 파라미터를 모두 입력해야 합니다.');
        }
        if (month < 1 || month > 12) {
            throw new BadRequestException('month 값은 1부터 12 사이여야 합니다.');
        }
        return this.emotionService.getMonthlyEmotionTypeCount(req.user!.uid, year, month);
    }

    @Get('random-topic')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '감정 기록 시작 전에 주제 질문 랜덤으로 가져오기' })
    @ApiResponse({ status: 200, description: '랜덤 주제 반환 성공' })
    @ApiResponse({ status: 404, description: '주제 질문이 존재하지 않음' })
    async getRandomTopic(@Req() req: Request) {
        return this.emotionService.getRandomTopic(req.user!.uid);
    }

    @Delete(':recordId')
    @UseGuards(AuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: '특정 감정 기록 삭제' })
    @ApiParam({ name: 'recordId', required: true, description: '삭제할 감정 기록 ID' })
    @ApiResponse({ status: 200, description: '감정 기록 삭제 성공' })
    @ApiResponse({ status: 404, description: '감정 기록 없음 or 권한 없음' })
    async deleteRecord(@Req() req: Request, @Param('recordId') recordId: string) {
        return this.emotionService.deleteRecord(req.user!.uid, recordId);
    }
}
  