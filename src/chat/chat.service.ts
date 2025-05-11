import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import * as admin from 'firebase-admin';
import axios from 'axios';
import { ChatMessage } from './interfaces/chat-message.interface';

@Injectable()
export class ChatService {
  constructor(private readonly firebaseService: FirebaseService) {}

  // 🔹 대화 시작 시 초기 인사말 가져오기 (AI API 호출)
  async getInitialMessage(uid: string): Promise<ChatMessage> {
    const firestore = this.firebaseService.getFirestore();

    try {
      const { data } = await axios.get(`${process.env.AI_SERVER_URL}/ai/chat/init`);
      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };

      await firestore.collection('users').doc(uid).collection('chat_history').add(aiMessage);
      return aiMessage;
    } catch (err) {
      console.error('AI 초기 메시지 호출 실패:', err);
      throw new InternalServerErrorException('AI 초기 메시지 호출 실패');
    }
  }

  // 🔹 사용자 메시지 전달 → AI 응답 받아서 Firestore에 저장
  async sendMessage(uid: string, userMessage: string, firebaseIdToken: string): Promise<ChatMessage> {
    const firestore = this.firebaseService.getFirestore();

    const userData: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    await firestore.collection('users').doc(uid).collection('chat_history').add(userData);

    try {
      const { data } = await axios.post(
        `${process.env.AI_SERVER_URL}/ai/chat`,
        { message: userMessage },
        {
          headers: {
            Authorization: `Bearer ${firebaseIdToken}`,
          },
          timeout: 10000,
        },
      );

      const aiReply: ChatMessage = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };

      await firestore.collection('users').doc(uid).collection('chat_history').add(aiReply);
      return aiReply;
    } catch (err) {
      console.error('AI 응답 실패:', {
        message: err?.message,
        data: err?.response?.data,
      });
      throw new InternalServerErrorException('AI 응답 실패');
    }
  }

  // 🔹 대화 기록 조회
  async getChatHistory(uid: string): Promise<ChatMessage[]> {
    const firestore = this.firebaseService.getFirestore();
    const snapshot = await firestore
      .collection('users')
      .doc(uid)
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
