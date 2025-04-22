import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier'; // 토큰 타입

interface AuthedRequest extends Request {
  user: DecodedIdToken; // req.user에 타입 지정
}

@Controller('user')
export class UserController {
  @UseGuards(AuthGuard)
  @Get('me')
  getUser(@Req() req: AuthedRequest) {
    return {
      uid: req.user.uid,
      email: req.user.email,
    };
  }
}
