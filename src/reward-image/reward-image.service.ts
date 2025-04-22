import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { SaveRewardImageDto } from './dto/save-reward-image.dto';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { RewardHistory } from './interfaces/reward-history.interface';

@Injectable()
export class RewardImageService {
  constructor(private readonly firebaseService: FirebaseService) {}

  // 🎁 AI 답례 그림 이미지 저장
  // - base64 이미지를 Firebase Storage에 업로드
  // - 보상 이력을 Firestore에 기록
  // - 사용자의 마지막 보상 streak을 Firestore에 업데이트
  async saveRewardImage(uid: string, dto: SaveRewardImageDto) {
    const storage = admin.storage().bucket();
    const firestore = this.firebaseService.getFirestore();

    // base64 → Buffer 변환
    const base64Data = dto.image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // 파일명 및 저장 경로 설정
    const filename = `reward/${uid}/${uuidv4()}.png`;
    const file = storage.file(filename);

    // 이미지 저장
    await file.save(imageBuffer, {
      metadata: { contentType: 'image/png' },
      public: true, // 공개 접근 가능
    });

    const imageUrl = `https://storage.googleapis.com/${storage.name}/${filename}`;

    // Firestore에 보상 기록 추가
    await firestore.collection('users').doc(uid)
      .collection('reward_history')
      .add({
        imageUrl,
        givenAt: new Date(),
        streakAtGiven: dto.streak,
      });

    // 마지막 보상 streak 업데이트
    await firestore.collection('users').doc(uid).set({
      lastRewardStreak: dto.streak
    }, { merge: true });

    return { message: 'Reward image saved', imageUrl };
  }

  // 📜 AI 답례 그림 보관함 조회
  // - 사용자의 reward_history 서브컬렉션을 내림차순으로 반환
  async getRewardHistory(uid: string): Promise<RewardHistory[]> {
    const firestore = this.firebaseService.getFirestore();
    const snapshot = await firestore
      .collection('users')
      .doc(uid)
      .collection('reward_history')
      .orderBy('givenAt', 'desc')
      .get();

    return snapshot.docs.map(doc => doc.data() as RewardHistory);
  }
}
