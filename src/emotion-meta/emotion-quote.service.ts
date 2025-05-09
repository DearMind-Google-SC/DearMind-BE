import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class EmotionQuoteService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async getRandomQuote(): Promise<{ quote: string; author?: string }> {
    const snapshot = await this.firebaseService.getFirestore()
      .collection('emotion_quotes')
      .get();

    if (snapshot.empty) {
      throw new NotFoundException('등록된 명언이 없습니다.');
    }

    const quotes = snapshot.docs.map(doc => doc.data());
    const random = quotes[Math.floor(Math.random() * quotes.length)];
    return {
      quote: random.quote,
      author: random.author || 'Anonymous',
    };
  }
}
