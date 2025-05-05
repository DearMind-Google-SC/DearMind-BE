import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './firebase/firebase.module';
import { UserController } from './user/user.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { EmotionRecordModule } from './emotion-record/emotion-record.module';
import { SelfcareModule } from './selfcare/selfcare.module';
import { RewardImageModule } from './reward-image/reward-image.module';
import { EmergencyModule } from './emergency/emergency.module';
import { ChatModule } from './chat/chat.module';

@Module({
  controllers: [AppController, UserController],
  providers: [AppService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FirebaseModule,
    AuthModule,
    EmotionRecordModule,
    SelfcareModule,
    RewardImageModule,
    EmergencyModule,
    ChatModule,
  ],
})
export class AppModule {}
