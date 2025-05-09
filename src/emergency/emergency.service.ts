import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ONLINE_COUNSELING_CENTERS } from './constants/online-centers';
import { PlaceResult } from './types/place-result';

@Injectable()
export class EmergencyService {
  constructor(private readonly httpService: HttpService) {}

  // ✅ 고정된 온라인 상담소 정보 반환 (프론트 고정 배너 등에서 사용)
  getOnlineCenters(): typeof ONLINE_COUNSELING_CENTERS {
    return ONLINE_COUNSELING_CENTERS;
  }

  // ✅ 사용자 위치 기반 주변 심리상담소 추천
  async findNearby(
    latitude: number,
    longitude: number,
    acceptLanguage: string = 'en' // 기본 언어 설정
  ): Promise<
    {
      name: string;
      address: string;
      location: { lat: number; lng: number };
      distanceKm: number; // 거리(km)
      rating?: number;
      userRatingsTotal?: number;
    }[]
  > {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('Google Maps API Key가 설정되지 않았습니다.');
    }

    // ✅ 사용자 언어에 따라 검색 키워드 다르게 설정
    const isKorean = acceptLanguage.toLowerCase().includes('ko');
    const keyword = encodeURIComponent(isKorean ? '심리상담' : 'counseling');
    const radius = 30000; // 30km 반경 검색

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=${keyword}&key=${apiKey}`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const places: PlaceResult[] = response.data.results;

      // ✅ 한영 키워드로 의미 있는 장소만 필터링
      const keywords = [
        '상담', '심리', '정신건강', '정신과', '마음치유', '센터', '정신의학',
        'mental', 'counsel', 'therapy', 'clinic', 'psychology', 'support'
      ];

      const filtered = places.filter(place =>
        keywords.some(kw => place.name.toLowerCase().includes(kw.toLowerCase()))
      );

      // ✅ 장소 이름으로 중복 제거
      const uniqueMap = new Map<string, PlaceResult>();
      for (const place of filtered) {
        if (!uniqueMap.has(place.name)) {
          uniqueMap.set(place.name, place);
        }
      }

      // ✅ 거리 계산 함수
      const calcDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const toRad = (val: number) => (val * Math.PI) / 180;
        const R = 6371; // 지구 반지름 (km)
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      // ✅ 정제 및 거리 계산
      const enriched = Array.from(uniqueMap.values()).map(place => {
        const dist = calcDistanceKm(latitude, longitude, place.geometry.location.lat, place.geometry.location.lng);
        return {
          name: place.name,
          address: place.vicinity,
          location: place.geometry.location,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          distanceKm: dist
        };
      });

      // ✅ 평점 x 리뷰 수로 점수 계산 → 거리순 정렬
      const sorted = enriched
        .sort((a, b) => a.distanceKm - b.distanceKm) // 거리 기준 오름차순
        .slice(0, 3); // ✅ 가장 가까운 3개만 반환

      return sorted;
    } catch (e) {
      console.error('Google Places API 호출 오류:', e);
      throw new InternalServerErrorException('상담소 정보를 불러오는 중 문제가 발생했습니다.');
    }
  }
}
