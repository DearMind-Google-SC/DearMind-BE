import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { EmotionType } from '../selfcare/enums/emotion-type.enum';

@Injectable()
export class EmotionComboIconService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getCombinationIcon(emotions: EmotionType[]): Promise<{ imageUrl: string }> {
    const firestore = this.firebaseService.getFirestore();

    // 알파벳 순 정렬 후 문자열 결합
    const sortedKey = [...emotions].sort().join('_'); // 예: ['ANGRY', 'HAPPY'] → 'ANGRY_HAPPY'

    const docRef = firestore.collection('emotion_combinations').doc(sortedKey);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException('해당 감정 조합 이미지가 없습니다.');
    }

    const data = doc.data();
    return { imageUrl: data!.imageUrl };
  }
}
