import { RewardStyle } from '../enums/reward-style.enum';

export interface RewardHistory {
  imageUrl: string;
  letter: string;
  style?: RewardStyle;
  givenAt: Date;
  streakAtGiven: number;
  liked?: boolean;
}
