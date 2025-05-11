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
import { SaveAIChatDto } from './dto/save-ai-chat.dto';
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

  @Post('user-message')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 메시지 저장 및 반환', description: '사용자의 메시지를 저장하고 반환합니다.' })
  @ApiBody({ type: SendChatDto })
  @ApiResponse({ status: 201, description: '사용자 메시지 저장 완료' })
  async saveUserMessage(@Req() req: Request, @Body() body: SendChatDto) {
    const uid = req.user!.uid;
    const message = await this.chatService.saveUserMessage(uid, body.message);
    return { message };
  }

  @Post('ai-reply')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI 응답 저장 및 반환', description: 'AI 팀원이 생성한 응답을 저장하고 반환합니다.' })
  @ApiBody({ type: SaveAIChatDto })
  @ApiResponse({ status: 201, description: 'AI 응답 저장 완료' })
  async saveAIReply(@Req() req: Request, @Body() body: SaveAIChatDto) {
    const uid = req.user!.uid;
    const aiMessage = await this.chatService.saveAIMessage(uid, body.message);
    return { aiMessage };
  }

  @Get('history')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '사용자 챗봇 대화 기록 조회 (최신순)', description: '최신 대화부터 최대 20개의 챗봇 대화 기록을 반환합니다.' })
  @ApiResponse({ status: 200, description: '대화 기록 반환 성공' })
  async getHistory(@Req() req: Request) {
    return this.chatService.getChatHistory(req.user!.uid);
  }
}