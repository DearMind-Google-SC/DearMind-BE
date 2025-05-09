import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { EmotionType } from '../selfcare/enums/emotion-type.enum';

@Injectable()
export class EmotionIconService {
  constructor(private readonly firebaseService: FirebaseService) {}

  // ✅ 감정 타입으로 직접 조회 (emotion이 undefined 또는 유효하지 않으면 UNKNOWN 처리)
  async getIconByEmotion(emotion: EmotionType | 'UNKNOWN'): Promise<{ emotion: string; imageUrl: string }> {
    const firestore = this.firebaseService.getFirestore();
    const target = Object.values(EmotionType).includes(emotion as EmotionType) ? emotion : 'UNKNOWN';

    const doc = await firestore.collection('emotion_icons').doc(target).get();
    if (!doc.exists) {
      throw new NotFoundException(`Emotion icon for ${target} not found`);
    }

    const data = doc.data();
    return {
      emotion: target,
      imageUrl: data!.imageUrl,
    };
  }

  // ✅ 오늘 감정 기록 중 가장 최근 감정 → 없으면 UNKNOWN 반환
  async getIconForToday(uid: string): Promise<{ emotion: string; imageUrl: string }> {
    const firestore = this.firebaseService.getFirestore();

    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const snapshot = await firestore
      .collection('diary')
      .where('uid', '==', uid)
      .where('createdAt', '>=', startOfDay)
      .where('createdAt', '<=', endOfDay)
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    let emotion: EmotionType | 'UNKNOWN' = 'UNKNOWN';

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data();
      emotion = data.emotionType ?? 'UNKNOWN';
    }

    return this.getIconByEmotion(emotion);
  }
}
