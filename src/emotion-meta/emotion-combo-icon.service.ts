import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { EmotionType } from '../selfcare/enums/emotion-type.enum';

@Injectable()
export class EmotionComboIconService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getCombinationIcon(emotions: EmotionType[]): Promise<{ imageUrl: string }> {
    const firestore = this.firebaseService.getFirestore();

    // 알파벳 순 정렬
    const sorted = [...emotions].sort();

    const snapshot = await firestore
      .collection('emotion_combinations')
      .where('emotions', '==', sorted)
      .limit(1)
      .get();

    if (snapshot.empty) {
      throw new NotFoundException('해당 감정 조합 이미지가 없습니다.');
    }

    const data = snapshot.docs[0].data();
    return { imageUrl: data.imageUrl };
  }
}
