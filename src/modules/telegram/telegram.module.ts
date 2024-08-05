import { Module, NotFoundException } from '@nestjs/common';
import { TelegrafModule, TelegrafModuleOptions } from 'nestjs-telegraf';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { TelegramUpdate } from './telegram.update';
import { StoryScene } from './story.scene';
import * as LocalSession from 'telegraf-session-local';
import { HomeScene } from './stories/home.scene';
import { TaxScene } from './stories/tax.scene';
import { PostgresAdapter } from 'kysely';
import { Postgres } from '@telegraf/session/pg';
import { session } from 'telegraf';
import { TaskProcessingQueueModule } from '../task-processing-queue/task-processing-queue.module';
import { UserModule } from '../user/user.module';
import { WizardScene } from './stories/wizard.scene';
import { FormScene } from './stories/form/form.scene';
import { TelegramService } from '../telegram-config/telegram.service';
import { TelegamConfigModule } from '../telegram-config/telegram-config.module';
import { QuestionModule } from '../question/question.module';
import { FeatureModule } from '../feature/feature.module';
import { TaskModule } from '../task/task.module';
import { SubscriptionModule } from '../subscription/subscription.module';

@Module({
	imports: [
		TaskProcessingQueueModule,
		UserModule,
		QuestionModule,
		TelegamConfigModule,
		FeatureModule,
		TaskModule,
		SubscriptionModule,
	],
	controllers: [],
	providers: [HomeScene, TaxScene, StoryScene, WizardScene, FormScene, TelegramUpdate, TelegramService],
	exports: [TelegramService],
})
export class TelegramModule {};