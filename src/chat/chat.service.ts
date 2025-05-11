import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { ChatMessage } from './interfaces/chat-message.interface';
import * as admin from 'firebase-admin';

@Injectable()
export class ChatService {
  constructor(private readonly firebaseService: FirebaseService) {}

  // 사용자 메시지 저장 및 반환
  async saveUserMessage(uid: string, message: string): Promise<ChatMessage> {
    const firestore = this.firebaseService.getFirestore();
    const data: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    await firestore.collection('users').doc(uid).collection('chat_history').add(data);
    return data;
  }

  // AI 응답 저장 및 반환
  async saveAIMessage(uid: string, message: string): Promise<ChatMessage> {
    const firestore = this.firebaseService.getFirestore();
    const data: ChatMessage = {
      role: 'assistant',
      content: message,
      timestamp: new Date(),
    };

    await firestore.collection('users').doc(uid).collection('chat_history').add(data);
    return data;
  }

  // 이전 대화 조회 (최신순)
  async getChatHistory(uid: string): Promise<ChatMessage[]> {
    const firestore = this.firebaseService.getFirestore();
    const snapshot = await firestore.collection('users').doc(uid)
      .collection('chat_history')
      .orderBy('timestamp', 'desc')
      .limit(20)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        role: data.role,
        content: data.content,
        timestamp: (data.timestamp as admin.firestore.Timestamp).toDate(),
      };
    });
  }
}