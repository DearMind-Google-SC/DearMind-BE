import { Body, Controller, Post, UseGuards, Req, Patch, Get, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: '회원가입' })
  @ApiResponse({ status: 201, description: '회원가입 성공' })
  @ApiResponse({ status: 400, description: '이메일 형식 오류 또는 이미 존재하는 이메일' })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      example1: {
        summary: '기본 예시',
        value: {
          email: 'test@example.com',
          password: 'password1234',
          name: '홍길동',
        },
      },
    },
  })
  signUp(@Body() dto: CreateUserDto) {
    return this.authService.signUp(dto);
  }

  @Post('login')
  @ApiOperation({ summary: '로그인 (토큰 검증)' })
  @ApiResponse({ status: 200, description: '로그인 성공' })
  @ApiResponse({ status: 401, description: '유효하지 않은 토큰' })
  @ApiBody({
    type: LoginDto,
    examples: {
      example1: {
        summary: '로그인 예시',
        value: {
          idToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE2ZGY...'
        },
      },
    },
  })
  login(@Body() dto: LoginDto) {
    return this.authService.signIn(dto);
  }

  @Post('test-login')
  @ApiOperation({ summary: '테스트용 로그인 (idToken 발급)' })
  @ApiResponse({ status: 200, description: 'idToken 반환' })
  @ApiResponse({ status: 401, description: '이메일 또는 비밀번호 오류' })
  @ApiBody({
    schema: {
      example: {
        email: 'test@example.com',
        password: 'password1234',
      },
    },
  })
  testLogin(@Body() dto: { email: string; password: string }) {
    return this.authService.loginWithEmail(dto);
  }

  @UseGuards(AuthGuard)
  @Patch('password')
  @ApiBearerAuth()
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiResponse({ status: 200, description: '비밀번호 변경 성공' })
  @ApiResponse({ status: 400, description: '비밀번호 변경 실패' })
  @ApiBody({
    type: UpdatePasswordDto,
    examples: {
      example1: {
        summary: '비밀번호 변경 예시',
        value: {
          newPassword: 'newSecurePassword123!',
        },
      },
    },
  })
  updatePassword(@Req() req: Request, @Body() dto: UpdatePasswordDto) {
    return this.authService.updatePassword(req.user!, dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: '비밀번호 재설정 이메일 발송' })
  @ApiResponse({ status: 200, description: '이메일 전송 성공' })
  @ApiResponse({ status: 400, description: '이메일 전송 실패' })
  @ApiBody({
    type: ResetPasswordDto,
    examples: {
      example1: {
        summary: '비밀번호 재설정 예시',
        value: {
          email: 'test@example.com',
        },
      },
    },
  })
  sendPasswordResetEmail(@Body() dto: ResetPasswordDto) {
    return this.authService.sendPasswordResetEmail(dto);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '로그인된 유저 정보 조회' })
  @ApiResponse({ status: 200, description: '유저 정보 반환 성공' })
  @ApiResponse({ status: 401, description: '인증 실패' })
  getMe(@Req() req: Request) {
    return this.authService.getMe(req.user!);
  }

  @UseGuards(AuthGuard)
  @Delete('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '회원 탈퇴' })
  @ApiResponse({ status: 200, description: '회원 탈퇴 완료' })
  @ApiResponse({ status: 400, description: '회원 탈퇴 실패' })
  deleteAccount(@Req() req: Request) {
    return this.authService.deleteAccount(req.user!.uid);
  }
}
