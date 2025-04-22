import { Module } from '@nestjs/common';
import { EmotionRecordController } from './emotion-record.controller';
import { EmotionRecordService } from './emotion-record.service';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [EmotionRecordController],
  providers: [EmotionRecordService],
})
export class EmotionRecordModule {}
