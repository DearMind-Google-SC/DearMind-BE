import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { EmotionType } from './enums/emotion-type.enum';
import * as admin from 'firebase-admin';

interface SelfcareRecommendation {
    emotion: EmotionType;
    recommended: string[];
    updatedAt?: admin.firestore.Timestamp;
  }

@Injectable()
export class SelfcareService {
  constructor(private readonly firebaseService: FirebaseService) {}

  // Fisher-Yates 셔플 알고리즘
  private shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // 감정 분석 기반 셀프케어 활동 추천
  async recommendSelfcare(uid: string, emotion: EmotionType) {
    const firestore = this.firebaseService.getFirestore();

    const emotionDoc = await firestore.collection('selfcare').doc(emotion).get();
    if (!emotionDoc.exists)
      throw new NotFoundException(`감정 "${emotion}"에 대한 셀프케어 활동이 존재하지 않습니다.`);

    const allActivities: string[] = emotionDoc.data()?.activities ?? [];

    const prevDoc = await firestore
      .collection('users')
      .doc(uid)
      .collection('selfcare_recommendation')
      .doc('latest')
      .get();

    const prevRecommended: string[] = prevDoc.exists ? prevDoc.data()?.recommended ?? [] : [];
    const candidatePool = allActivities.filter(a => !prevRecommended.includes(a));

    let selected: string[] = [];
    if (candidatePool.length >= 3) {
      selected = this.shuffle(candidatePool).slice(0, 3);
    } else {
      const fallback = allActivities.filter(a => !selected.includes(a));
      selected = [
        ...this.shuffle(candidatePool),
        ...this.shuffle(fallback).slice(0, 3 - candidatePool.length),
      ];
    }

    await firestore.collection('users')
      .doc(uid)
      .collection('selfcare_recommendation')
      .doc('latest')
      .set({
        emotion,
        recommended: selected,
        updatedAt: new Date(),
      });

    return { emotion, recommended: selected };
  }

  // 최근 추천된 셀프케어 활동 재사용 여부 판단 및 반환
  async getLatestRecommendation(uid: string) {
    const firestore = this.firebaseService.getFirestore();
    const doc = await firestore
      .collection('users')
      .doc(uid)
      .collection('selfcare_recommendation')
      .doc('latest')
      .get();

    if (!doc.exists) throw new NotFoundException('추천 이력이 없습니다.');

    const data = doc.data() as SelfcareRecommendation;
    const lastUpdated = data?.updatedAt?.toDate();
    if (!lastUpdated) throw new NotFoundException('업데이트된 추천 기록이 없습니다.');

    return {
      emotion: data.emotion,
      recommended: data.recommended,
      updatedAt: lastUpdated,
    };
  }
}
