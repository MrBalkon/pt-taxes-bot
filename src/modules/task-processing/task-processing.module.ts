import { Module } from '@nestjs/common';
import { TaskProcessingQueueService } from './services/task-processing.queue';
import { TASK_PROCESSING_QUEUE_NAME } from './task-processing.constants';
import { BullModule } from '@nestjs/bull';
import { TaskProcessingService } from './services/task.processing.service';
import { TaskProcessingQueueConsumer } from './services/task-processing.consumer';
import { SocialSecurityTask } from './tasks/social-security.task';
import { ConfigModule } from '../config/config.module';
import { UserModule } from '../user/user.module';
import { SeleniumModule } from '../selenium/selenium.module';
import { TelegramNotifyTask } from './tasks/telegram-notify.task';
import { TelegamConfigModule } from '../telegram-config/telegram-config.module';
import { InjectDynamicProviders } from 'nestjs-dynamic-providers';

@InjectDynamicProviders('dist/**/*.task.js')
@Module({
	imports: [
		ConfigModule,
		UserModule,
		SeleniumModule,
		TelegamConfigModule,
		BullModule.registerQueue({ name: TASK_PROCESSING_QUEUE_NAME }),
	],
	controllers: [],
	providers: [TaskProcessingQueueService, TaskProcessingQueueConsumer, TaskProcessingService],
	exports: [TaskProcessingQueueService, TaskProcessingService],
})
export class TaskProcessingModule {};