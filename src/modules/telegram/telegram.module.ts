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
import { TaskProcessingModule } from '../task-processing/task-processing.module';
import { UserModule } from '../user/user.module';
import { WizardScene } from './stories/wizard.scene';
import { FormScene } from './stories/form/form.scene';
import { TelegramService } from '../telegram-config/telegram.service';
import { TelegamConfigModule } from '../telegram-config/telegram-config.module';
import { QuestionModule } from '../question/question.module';

@Module({
	imports: [
		TaskProcessingModule,
		UserModule,
		QuestionModule,
		TelegamConfigModule,
	],
	controllers: [],
	providers: [HomeScene, TaxScene, StoryScene, WizardScene, FormScene, TelegramUpdate, TelegramService],
	exports: [TelegramService],
})
export class TelegramModule {};