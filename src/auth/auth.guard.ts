import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('토큰이 없습니다');
    }

    const idToken = authHeader.split(' ')[1];

    try {
      const decodedToken: DecodedIdToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken;
      return true;
    } catch (error) {
      console.error('토큰 검증 실패:', error);
      throw new UnauthorizedException('유효하지 않은 토큰입니다');
    }
  }
}
