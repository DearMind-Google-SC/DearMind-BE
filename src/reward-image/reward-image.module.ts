import { Module } from '@nestjs/common';
import { RewardImageService } from './reward-image.service';
import { RewardImageController } from './reward-image.controller';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  controllers: [RewardImageController],
  providers: [RewardImageService, FirebaseService],
})
export class RewardImageModule {}