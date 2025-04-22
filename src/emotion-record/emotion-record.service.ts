import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { v4 as uuidv4 } from 'uuid';
import * as admin from 'firebase-admin';
import { CreateEmotionRecordDto } from './dto/create-emotion-record.dto';

// 감정 기록 타입 인터페이스 정의
interface EmotionRecord {
  uid: string; // 사용자 UID
  imageUrl: string; // 저장된 이미지 URL
  text?: string; // 텍스트 일기 (선택)
  createdAt: admin.firestore.Timestamp; // 생성 시간
}

@Injectable()
export class EmotionRecordService {
  constructor(private readonly firebaseService: FirebaseService) {}

  // 감정 기록 저장 (이미지 업로드 + Firestore 저장 + streak 업데이트)
  async saveRecord(uid: string, body: CreateEmotionRecordDto) {
    const firestore = this.firebaseService.getFirestore();
    const storage = admin.storage().bucket();

    // base64 이미지 문자열에서 헤더 제거 후 버퍼로 변환
    const base64Data = body.image.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // UUID 기반 파일 이름 지정 후 업로드
    const filename = `diary/${uid}/${uuidv4()}.png`;
    const file = storage.file(filename);
    await file.save(imageBuffer, {
      metadata: { contentType: 'image/png' },
      public: true, // 공개 URL로 접근 가능하게 설정
    });

    const imageUrl = `https://storage.googleapis.com/${storage.name}/${filename}`;
    const createdAt = new Date();

    // Firestore에 감정기록 저장
    await firestore.collection('diary').add({
      uid,
      imageUrl,
      text: body.text ?? null,
      createdAt,
    });

    // 연속 기록 계산 후 사용자 문서에 streak 및 lastRecordedDate 업데이트
    const streakInfo = await this.calculateStreak(uid);
    await firestore.collection('users').doc(uid).set({
      streak: streakInfo.streak,
      lastRecordedDate: createdAt.toISOString().split('T')[0],
    }, { merge: true });

    return { message: '감정 기록 저장 완료', imageUrl };
  }

  // 사용자의 전체 감정 기록 조회 (최신순 정렬)
  async getAllRecords(uid: string) {
    const firestore = this.firebaseService.getFirestore();
    const snapshot = await firestore
      .collection('diary')
      .where('uid', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
      throw new NotFoundException('감정기록이 존재하지 않습니다.');
    }

    return snapshot.docs.map(doc => {
      const data = doc.data() as EmotionRecord;
      return {
        imageUrl: data.imageUrl,
        text: data.text,
        createdAt: data.createdAt.toDate(),
      };
    });
  }

  // 특정 날짜의 감정 기록 여러 건 조회
  async getRecordByDate(uid: string, dateStr: string) {
    const firestore = this.firebaseService.getFirestore();
    const date = new Date(dateStr);
    const start = new Date(date.setHours(0, 0, 0, 0));
    const end = new Date(date.setHours(23, 59, 59, 999));

    const snapshot = await firestore
      .collection('diary')
      .where('uid', '==', uid)
      .where('createdAt', '>=', start)
      .where('createdAt', '<=', end)
      .get();

    if (snapshot.empty) {
      throw new NotFoundException('해당 날짜의 감정 기록이 없습니다.');
    }

    return snapshot.docs.map(doc => {
      const data = doc.data() as EmotionRecord;
      return {
        imageUrl: data.imageUrl,
        text: data.text,
        createdAt: data.createdAt.toDate(),
      };
    });
  }

  // 감정 기록이 존재하는 날짜 목록 반환
  async getRecordDates(uid: string) {
    const firestore = this.firebaseService.getFirestore();
    const snapshot = await firestore
      .collection('diary')
      .where('uid', '==', uid)
      .get();

    if (snapshot.empty) {
      throw new NotFoundException('감정기록이 존재하지 않습니다.');
    }

    const dates = new Set<string>();
    snapshot.forEach(doc => {
      const data = doc.data() as EmotionRecord;
      const date = data.createdAt.toDate().toISOString().split('T')[0];
      dates.add(date);
    });

    return { dates: [...dates] };
  }

  // 연속 감정 기록 일 수 계산 로직
  async calculateStreak(uid: string): Promise<{ streak: number }> {
    const firestore = this.firebaseService.getFirestore();
    const snapshot = await firestore
      .collection('diary')
      .where('uid', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();

    if (snapshot.empty) {
      return { streak: 0 };
    }

    // 고유 날짜만 추출하여 내림차순 정렬
    const uniqueDates = [...new Set(
      snapshot.docs.map(doc => {
        const data = doc.data() as EmotionRecord;
        return data.createdAt.toDate().toISOString().split('T')[0];
      })
    )].sort((a, b) => b.localeCompare(a));

    let streak = 0;
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const hasToday = uniqueDates.includes(todayStr);

    const baseDate = hasToday ? today : new Date(today.setDate(today.getDate() - 1));

    for (const dateStr of uniqueDates) {
      const expected = new Date(baseDate);
      expected.setDate(baseDate.getDate() - streak);
      const expectedStr = expected.toISOString().split('T')[0];

      if (dateStr === expectedStr) {
        streak++;
      } else {
        break;
      }
    }

    return { streak };
  }

  // 저장된 streak 필드 조회 (Firestore users 문서에서 읽기)
  async getStreak(uid: string) {
    const firestore = this.firebaseService.getFirestore();
    const userDoc = await firestore.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      throw new NotFoundException('사용자 정보를 찾을 수 없습니다.');
    }

    const data = userDoc.data();
    return { streak: data?.streak ?? 0 };
  }

}
