export interface PlaceResult {
    name: string;
    vicinity: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    rating?: number; // 장소 평점 (있을 수도, 없을 수도 있음)
    user_ratings_total?: number; // 리뷰 수 (snake_case 그대로, API 응답 형식 기준)
    }
  