import {
  Controller,
  Get,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { GetNearbyCentersDto } from './dto/get-emergency.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Emergency')
@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Get('online-centers')
  @ApiOperation({ summary: '고정 온라인 상담소 리스트 제공' })
  @ApiResponse({ status: 200, description: '온라인 상담소 리스트 반환 성공' })
  getOnlineCenters() {
    return this.emergencyService.getOnlineCenters();
  }

  @Post('nearby-centers')
  @ApiOperation({ summary: '사용자 위치 기반 상담소 추천 (Google Places API)' })
  @ApiBody({ type: GetNearbyCentersDto })
  @ApiResponse({ status: 200, description: '근처 상담소 조회 성공' })
  @ApiResponse({ status: 500, description: 'Google API 호출 실패 또는 서버 오류' })
  async getNearbyCenters(@Body() dto: GetNearbyCentersDto) {
    try {
      return await this.emergencyService.findNearby(dto.latitude, dto.longitude);
    } catch {
      throw new HttpException(
        '근처 상담소 조회 실패',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
