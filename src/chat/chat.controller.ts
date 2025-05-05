import {
    Controller,
    Post,
    Body,
    Get,
    Req,
    UseGuards,
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
      summary: '사용자 메시지 저장, AI 응답 저장 및 반환',
      description:
        '사용자 메시지를 저장하고 AI 응답만 반환합니다. (사용자 메시지는 프론트에서 바로 표시됨)',
    })
    @ApiBody({ type: SendChatDto })
    @ApiResponse({ status: 201, description: '사용자 메시지 저장, AI 응답 저장 및 반환 완료' })
    async sendMessage(@Req() req: Request, @Body() body: SendChatDto) {
      const uid = req.user!.uid;
  
      // 사용자 메시지 저장
      await this.chatService.saveUserMessage(uid, body.message);
  
      // ✅ 실제 AI 응답 로직은 AI 팀원이 구현 예정
      const aiReplyContent = '응답 준비 중입니다.';
  
      // AI 응답 저장
      const aiMessage = await this.chatService.saveAIMessage(uid, aiReplyContent);
  
      return {
        aiMessage,
      };
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
  }
  