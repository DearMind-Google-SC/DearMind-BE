import { Module } from '@nestjs/common';
import { EmotionRecordController } from './emotion-record.controller';
import { EmotionRecordService } from './emotion-record.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { EmotionMetaModule } from '../emotion-meta/emotion-meta.module';

@Module({
  imports: [FirebaseModule, EmotionMetaModule],
  controllers: [EmotionRecordController],
  providers: [EmotionRecordService],
})
export class EmotionRecordModule {}

