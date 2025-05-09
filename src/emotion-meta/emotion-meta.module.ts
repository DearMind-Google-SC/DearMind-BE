import { Module } from '@nestjs/common';
import { EmotionIconService } from './emotion-icon.service';
import { EmotionIconController } from './emotion-icon.controller';
import { EmotionQuoteService } from './emotion-quote.service';
import { EmotionQuoteController } from './emotion-quote.controller';
import { EmotionComboIconService } from './emotion-combo-icon.service';
import { EmotionComboIconController } from './emotion-combo-icon.controller';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  controllers: [
    EmotionIconController,
    EmotionQuoteController,
    EmotionComboIconController,
  ],
  providers: [
    EmotionIconService,
    EmotionQuoteService,
    EmotionComboIconService,
    FirebaseService,
  ],
  exports: [EmotionComboIconService],
})
export class EmotionMetaModule {}
