import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, FirebaseService],
})
export class ChatModule {}
