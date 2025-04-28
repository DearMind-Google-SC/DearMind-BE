import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { v4 as uuidv4 } from 'uuid';
import * as admin from 'firebase-admin';
import { CreateEmotionRecordDto } from './dto/create-emotion-record.dto';
import { UpdateEmotionTypeDto } from './dto/update-emotion-type.dto';
import { EmotionType } from '../selfcare/enums/emotion-type.enum';

// 감정 기록 인터페이스 정의
interface EmotionRecord {
  uid: string; // 사용자 UID
  imageUrl: string; // 저장된 이미지 URL
  text?: string; // 텍스트 일기 (선택)
  createdAt: admin.firestore.Timestamp; // 생성 시간
}

// 주제 질문 인터페이스 정의
interface TopicDocument {
    content: string;
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
    const docRef = await firestore.collection('diary').add({
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

    return {
        message: '감정 기록 저장 완료',
        recordId: docRef.id,
        imageUrl,
      };
  }

  // 감정 타입 업데이트
  async updateEmotionType(uid: string, recordId: string, dto: UpdateEmotionTypeDto) {
    const firestore = this.firebaseService.getFirestore();
    const recordRef = firestore.collection('diary').doc(recordId);
  
    const recordDoc = await recordRef.get();
    if (!recordDoc.exists) {
      throw new NotFoundException('해당 감정 기록을 찾을 수 없습니다.');
    }
  
    const data = recordDoc.data();
    if (data?.uid !== uid) {
      throw new NotFoundException('권한이 없는 감정 기록입니다.');
    }
  
    await recordRef.update({
      emotionType: dto.emotionType,
    });
  
    return { message: '감정 타입 업데이트 완료' };
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

  // 특정 날짜 감정 타입 리스트 조회 (중복 제거)
  async getEmotionTypesByDate(uid: string, dateStr: string) {
    const firestore = this.firebaseService.getFirestore();
    const date = new Date(dateStr); // 사용자가 요청한 날짜
    const start = new Date(date.setHours(0, 0, 0, 0)); // 그날 00:00:00
    const end = new Date(date.setHours(23, 59, 59, 999)); // 그날 23:59:59
  
    const snapshot = await firestore
      .collection('diary')
      .where('uid', '==', uid)
      .where('createdAt', '>=', start)
      .where('createdAt', '<=', end)
      .get();
  
    if (snapshot.empty) {
      return { emotionTypes: [] };
    }
  
    const types = new Set<EmotionType>(); // 감정 중복 제거
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.emotionType) {
        types.add(data.emotionType);
      }
    });
  
    return { emotionTypes: Array.from(types) };
  }

  // 월별 감정 타입별 개수 조회 (개수 순 정렬)
  async getMonthlyEmotionTypeCount(uid: string, year: number, month: number) {
    const firestore = this.firebaseService.getFirestore();
  
    const start = new Date(year, month - 1, 1, 0, 0, 0); // 1일 00시
    const end = new Date(year, month, 0, 23, 59, 59, 999); // 마지막날 23시 59분
  
    const snapshot = await firestore
      .collection('diary')
      .where('uid', '==', uid)
      .where('createdAt', '>=', start)
      .where('createdAt', '<=', end)
      .get();
  
    if (snapshot.empty) {
      return { emotionTypeCounts: [] };
    }
  
    const counter: Record<EmotionType, number> = {
      HAPPY: 0,
      GLOOMY: 0,
      ANGRY: 0,
      ANXIOUS: 0,
    };
  
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.emotionType) {
        counter[data.emotionType as EmotionType]++;
      }
    });
  
    const sorted = Object.entries(counter)
      .filter(([, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([emotionType, count]) => ({ emotionType, count }));
  
    return { emotionTypeCounts: sorted };
  }

  // Fisher-Yates 셔플 알고리즘
  private shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  
  // 감정 기록 시작 전에 주제 질문 랜덤 가져오기
  async getRandomTopic(uid: string) {
    const firestore = this.firebaseService.getFirestore();
  
    // 전체 topics 가져오기
    const snapshot = await firestore.collection('topics').get();
    if (snapshot.empty) {
      throw new NotFoundException('주제 질문이 존재하지 않습니다.');
    }
    const allTopics = snapshot.docs
    .map(doc => (doc.data() as TopicDocument).content)
    .filter((content): content is string => content !== undefined);
  
    // 사용자가 최근 일주일간 추천받았던 주제 질문 목록 가져오기
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
    const recentSnapshot = await firestore
      .collection('users')
      .doc(uid)
      .collection('topic_recommendation')
      .where('recommendedAt', '>=', sevenDaysAgo)
      .get();
  
    const recentTopics = recentSnapshot.docs.map(doc => doc.data().topic as string);
  
    // 후보군: 최근 7일 추천 주제 제외
    const candidatePool = allTopics.filter(topic => !recentTopics.includes(topic));
  
    let selectedTopic: string;
  
    if (candidatePool.length > 0) {
      selectedTopic = this.shuffle(candidatePool)[0];
    } else {
      // 만약 다 겹쳐서 후보군이 없다면 전체 중에서 다시 뽑는다
      selectedTopic = this.shuffle(allTopics)[0];
    }
  
    // 추천 기록 저장
    await firestore
      .collection('users')
      .doc(uid)
      .collection('topic_recommendation')
      .add({
        topic: selectedTopic,
        recommendedAt: new Date(),
      });
  
    return { topic: selectedTopic };
  }

  // 감정 기록 삭제 기능
  async deleteRecord(uid: string, recordId: string) {
    const firestore = this.firebaseService.getFirestore();
    const recordRef = firestore.collection('diary').doc(recordId);
    const recordDoc = await recordRef.get();

    if (!recordDoc.exists) {
      throw new NotFoundException('해당 감정 기록을 찾을 수 없습니다.');
    }

    // 다른 유저 기록 삭제 방지
    const data = recordDoc.data() as EmotionRecord;
    if (data.uid !== uid) {
      throw new NotFoundException('해당 감정 기록을 삭제할 권한이 없습니다.');
    }

    await recordRef.delete();

    return { message: '감정 기록 삭제 완료' };
  }

}
