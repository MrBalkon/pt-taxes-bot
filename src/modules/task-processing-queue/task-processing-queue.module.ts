import { Module } from '@nestjs/common';
import { TaskProcessingQueueService } from './task-processing-queue.service';
import { TASK_PROCESSING_QUEUE_NAME } from './task-processing-queue.constants';
import { BullModule } from '@nestjs/bull';
import { TaskProcessingService } from '../task-processing/task.processing.service';
import { TaskProcessingQueueConsumer } from '../task-processing-processor/task-processing.consumer';
import { ConfigModule } from '../config/config.module';
import { UserModule } from '../user/user.module';
import { SeleniumModule } from '../selenium/selenium.module';
import { TelegamConfigModule } from '../telegram-config/telegram-config.module';
import { QuestionModule } from '../question/question.module';
import { TaskModule } from '../task/task.module';
import { OperationModule } from '../operation/operation.module';
import { ExecutionScenarioModule } from '../execution-scenario/execution-scenario.module';
import { ExecutionCommandModule } from '../execution-command/execution-command.module';
import { NotificationModule } from '../notification/notification.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { FieldModule } from '../field/field.module';
import { TaskProcessingModule } from '../task-processing/task-processing.module';

@Module({
	imports: [
		TaskProcessingModule,
		ConfigModule,
		UserModule,
		QuestionModule,
		TaskModule,
		OperationModule,
		NotificationModule,
		BullModule.registerQueue({ name: TASK_PROCESSING_QUEUE_NAME }),
	],
	controllers: [],
	providers: [TaskProcessingQueueService],
	exports: [TaskProcessingQueueService],
})
export class TaskProcessingQueueModule {};