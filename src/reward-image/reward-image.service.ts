import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { SaveRewardImageDto } from './dto/save-reward-image.dto';
import * as admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { RewardHistory } from './interfaces/reward-history.interface';
import { RewardStyle } from './enums/reward-style.enum';

@Injectable()
export class RewardImageService {
  constructor(private readonly firebaseService: FirebaseService) {}

  // 🎁 AI 답례 그림 이미지 + 텍스트 일기 저장
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
      public: true,
    });

    const imageUrl = `https://storage.googleapis.com/${storage.name}/${filename}`;

    // Firestore에 보상 기록 추가
    await firestore.collection('users').doc(uid)
      .collection('reward_history')
      .add({
        imageUrl,
        letter: dto.letter,
        style: dto.style ?? this.getRandomStyle(),
        givenAt: new Date(),
        streakAtGiven: dto.streak,
        liked: false,
      });

    // 마지막 보상 streak 업데이트
    await firestore.collection('users').doc(uid).set({
      lastRewardStreak: dto.streak
    }, { merge: true });

    return { message: 'Reward image saved', imageUrl };
  }

  // AI 답례 그림 선호 스타일 -> Do it randomly 선택 시 랜덤 스타일 할당
  private getRandomStyle(): RewardStyle {
    const styles = Object.values(RewardStyle);
    const idx = Math.floor(Math.random() * styles.length);
    return styles[idx];
  }

  private mapDocToReward = (doc: FirebaseFirestore.QueryDocumentSnapshot): RewardHistory => {
    const data = doc.data();
    return {
      imageUrl: data.imageUrl,
      letter: data.letter,
      givenAt: data.givenAt,
      streakAtGiven: data.streakAtGiven,
      liked: data.liked,
      style: data.style,
    };
  };

  // 📜 AI 답례 보관함 조회
  // - 사용자의 reward_history 서브컬렉션을 내림차순으로 반환
  async getRewardHistory(uid: string): Promise<RewardHistory[]> {
    const snapshot = await this.firebaseService.getFirestore()
      .collection('users')
      .doc(uid)
      .collection('reward_history')
      .orderBy('givenAt', 'desc')
      .get();

    return snapshot.docs.map(this.mapDocToReward);
  }

  // 월별 AI 답례 리스트 조회 (최신순 정렬)
  async getMonthlyRewardHistory(uid: string, year: number, month: number): Promise<RewardHistory[]> {
    const firestore = this.firebaseService.getFirestore();
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const snapshot = await firestore.collection('users')
      .doc(uid)
      .collection('reward_history')
      .where('givenAt', '>=', start)
      .where('givenAt', '<=', end)
      .orderBy('givenAt', 'desc')
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        imageUrl: data.imageUrl,
        letter: data.letter,
        style: data.style,
        givenAt: data.givenAt,
        streakAtGiven: data.streakAtGiven,
        liked: data.liked,
      };
    });
  }

  // ❤️ AI 답례 좋아요 처리
  async likeReward(uid: string, rewardId: string) {
    const ref = this.firebaseService.getFirestore()
      .collection('users')
      .doc(uid)
      .collection('reward_history')
      .doc(rewardId);
  
    const doc = await ref.get();
    if (!doc.exists) {
      throw new NotFoundException('해당 보상이 존재하지 않습니다.');
    }
  
    const data = doc.data();
    if (!data) {
      throw new InternalServerErrorException('문서를 불러올 수 없습니다.');
    }
  
    const currentLiked = data.liked ?? false;
    await ref.update({ liked: !currentLiked });
  
    return { message: currentLiked ? '좋아요 취소됨' : '좋아요 설정됨' };
  }

  // 🧡 좋아요한 AI 답례만 조회 (최신순 정렬)
  async getLikedRewards(uid: string): Promise<RewardHistory[]> {
    const snapshot = await this.firebaseService.getFirestore()
      .collection('users')
      .doc(uid)
      .collection('reward_history')
      .where('liked', '==', true)
      .orderBy('givenAt', 'desc')
      .get();

    return snapshot.docs.map(this.mapDocToReward);
  }

  // AI 답례 스타일 예시 이미지 조회
  async getStyleSamples() {
    const firestore = this.firebaseService.getFirestore();
    const snapshot = await firestore.collection('style_samples').get();
    return snapshot.docs.map(doc => doc.data());
  }
}
