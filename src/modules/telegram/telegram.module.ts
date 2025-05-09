import { Module } from '@nestjs/common';
import { TelegramUpdate } from './telegram.update';
import { StoryScene } from './story.scene';
import { HomeScene } from './scenes/home/home.scene';
import { TaxScene } from './scenes/tax.scene';
import { TaskProcessingQueueModule } from '../task-processing-queue/task-processing-queue.module';
import { UserModule } from '../user/user.module';
import { WizardScene } from './scenes/wizard.scene';
import { FormScene } from './scenes/form/form.scene';
import { TelegramService } from '../telegram-config/telegram.service';
import { TelegamConfigModule } from '../telegram-config/telegram-config.module';
import { QuestionModule } from '../question/question.module';
import { FeatureModule } from '../feature/feature.module';
import { TaskModule } from '../task/task.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { UserRequestDataModule } from '../user-request-data/user-request-data.module';

@Module({
  imports: [
    TaskProcessingQueueModule,
    UserModule,
    QuestionModule,
    TelegamConfigModule,
    FeatureModule,
    TaskModule,
    SubscriptionModule,
    UserRequestDataModule,
  ],
  controllers: [],
  providers: [
    HomeScene,
    TaxScene,
    StoryScene,
    WizardScene,
    FormScene,
    TelegramUpdate,
    TelegramService,
  ],
  exports: [TelegramService],
})
export class TelegramModule {}
