import {
  Controller,
  Post,
  Body,
  Get,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ChatService } from './chat.service';
import { AuthGuard } from '../auth/auth.guard';
import { SendChatDto } from './dto/send-chat.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '사용자 메시지 전송 → AI 응답 생성, 저장 및 반환',
    description: '사용자 메시지를 저장하고 AI 응답을 받아 함께 저장 후 반환합니다.',
  })
  @ApiBody({ type: SendChatDto })
  @ApiResponse({ status: 201, description: 'AI 응답 생성 및 저장 성공' })
  @ApiResponse({ status: 500, description: 'AI 응답 실패' })
  async sendMessage(@Req() req: Request, @Body() body: SendChatDto) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization 헤더 누락 또는 형식 오류');
    }
    
    const idToken = authHeader.split(' ')[1]; // Bearer {idToken}
    return this.chatService.sendMessage(req.user!.uid, body.message, idToken);
  }

  @Get('history')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: '사용자 챗봇 대화 기록 조회 (최신순)',
    description: '최신 대화부터 최대 20개의 챗봇 대화 기록을 반환합니다.',
  })
  @ApiResponse({ status: 200, description: '대화 기록 반환 성공' })
  async getHistory(@Req() req: Request) {
    return this.chatService.getChatHistory(req.user!.uid);
  }

  @Get('init')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'AI 챗봇 초기 인삿말 조회 및 저장',
    description: 'AI 챗봇이 초기 로딩 시 보여줄 인삿말을 Firestore에 저장하고 반환합니다.',
  })
  @ApiResponse({ status: 200, description: '초기 메시지 반환 성공' })
  @ApiResponse({ status: 500, description: 'AI 초기 메시지 요청 실패' })
  async getInitialMessage(@Req() req: Request) {
    return this.chatService.getInitialMessage(req.user!.uid);
  }
}
