import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { DecodedIdToken } from 'firebase-admin/auth';
import axios from 'axios';

import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

@Injectable()
export class AuthService {
  private firebaseClientAuth;

  constructor(private readonly firebaseService: FirebaseService) {
    if (getApps().length === 0) {
      const firebaseConfig = {
        apiKey: process.env.FIREBASE_API_KEY!,
        authDomain: `${process.env.FIREBASE_PROJECT_ID}.firebaseapp.com`,
      };
      initializeApp(firebaseConfig);
    }

    this.firebaseClientAuth = getAuth();
  }

  // 회원가입 + Firestore 저장
  async signUp(dto: CreateUserDto) {
    const auth = this.firebaseService.getAuth();
    const firestore = this.firebaseService.getFirestore();

    const userRecord = await auth.createUser({
      email: dto.email,
      password: dto.password,
      displayName: dto.name,
    });

    await firestore.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      name: dto.name ?? null,
      createdAt: new Date(),
    });

    return {
      uid: userRecord.uid,
      email: userRecord.email,
      name: dto.name,
    };
  }

  // 로그인 (토큰 검증)
  async signIn(dto: LoginDto) {
    const auth = this.firebaseService.getAuth();
    try {
      const decodedToken = await auth.verifyIdToken(dto.idToken);
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
      };
    } catch (err) {
      console.error('[Firebase 로그인 실패]', err);
      throw new Error('토큰이 유효하지 않습니다.');
    }
  }

  // 이메일/비밀번호로 idToken 발급 (테스트용)
  async loginWithEmail(dto: { email: string; password: string }) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.firebaseClientAuth,
        dto.email,
        dto.password,
      );
      const idToken = await userCredential.user.getIdToken();
      return { idToken };
    } catch (err: any) {
      console.error('[Firebase 로그인 실패]', err?.message);
      throw new UnauthorizedException('이메일 또는 비밀번호 오류');
    }
  }

  // 로그인된 유저 정보 조회
  getMe(user: DecodedIdToken) {
    return {
      uid: user.uid,
      email: user.email,
      name: user.name || null,
    };
  }

  // 비밀번호 변경
  async updatePassword(user: DecodedIdToken, dto: UpdatePasswordDto) {
    const auth = this.firebaseService.getAuth();
    await auth.updateUser(user.uid, {
      password: dto.newPassword,
    });
    return { message: '비밀번호 변경 완료!' };
  }

  // 비밀번호 재설정 이메일 발송
  async sendPasswordResetEmail(dto: ResetPasswordDto) {
    const apiKey = process.env.FIREBASE_API_KEY;
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`;

    const payload = {
      requestType: 'PASSWORD_RESET',
      email: dto.email,
    };

    try {
      await axios.post(url, payload);
      return { message: '비밀번호 재설정 이메일을 보냈습니다.' };
    } catch (err: any) {
      console.error('[비밀번호 찾기 오류]', err?.response?.data || err?.message);
      throw new Error('비밀번호 재설정 이메일 전송 실패');
    }
  }

  // Firestore에 유저 정보 저장 기능 (필요 시 수동 호출)
  async saveUserToFirestore(user: DecodedIdToken) {
    const firestore = this.firebaseService.getFirestore();
    const userRef = firestore.collection('users').doc(user.uid);

    await userRef.set(
      {
        uid: user.uid,
        email: user.email,
        name: user.name || null,
        lastLoginAt: new Date(),
      },
      { merge: true }
    );

    return { message: 'Firestore에 유저 정보 저장 완료' };
  }

  // 회원 탈퇴 (Firebase + Firestore 삭제)
  async deleteAccount(uid: string) {
    const auth = this.firebaseService.getAuth();
    const firestore = this.firebaseService.getFirestore();

    await auth.deleteUser(uid);
    await firestore.collection('users').doc(uid).delete();

    return { message: '회원 탈퇴 완료!' };
  }
}
