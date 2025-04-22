import { Module } from '@nestjs/common';
import { SelfcareService } from './selfcare.service';
import { SelfcareController } from './selfcare.controller';
import { FirebaseModule } from '../firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  controllers: [SelfcareController],
  providers: [SelfcareService],
})
export class SelfcareModule {}
