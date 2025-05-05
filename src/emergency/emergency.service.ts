import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ONLINE_COUNSELING_CENTERS } from './constants/online-centers';

interface PlaceResult {
  name: string;
  vicinity: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

@Injectable()
export class EmergencyService {
  constructor(private readonly httpService: HttpService) {}

  // 고정된 온라인 상담소 정보 제공
  getOnlineCenters(): typeof ONLINE_COUNSELING_CENTERS {
    return ONLINE_COUNSELING_CENTERS;
  }

  // 사용자 위치 기반 상담소 추천
  async findNearby(latitude: number, longitude: number): Promise<
    {
      name: string;
      address: string;
      location: { lat: number; lng: number };
    }[]
  > {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException('Google Maps API Key가 설정되지 않았습니다.');
    }

    const radius = 5000;
    const keyword = 'counseling';
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&keyword=${keyword}&key=${apiKey}`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      const places: PlaceResult[] = response.data.results;

      return places.map((place) => ({
        name: place.name,
        address: place.vicinity,
        location: place.geometry.location,
      }));
    } catch (e) {
      console.error('Google Places API 호출 오류:', e);
      throw new InternalServerErrorException('상담소 정보를 불러오는 중 문제가 발생했습니다.');
    }
  }
}
