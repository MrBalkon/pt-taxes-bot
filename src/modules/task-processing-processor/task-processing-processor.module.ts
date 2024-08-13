import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TaskProcessingQueueConsumer } from './task-processing.consumer';
import { ConfigModule } from '../config/config.module';
import { UserModule } from '../user/user.module';
import { QuestionModule } from '../question/question.module';
import { TaskModule } from '../task/task.module';
import { OperationModule } from '../operation/operation.module';
import { NotificationModule } from '../notification/notification.module';
import { TaskProcessingModule } from '../task-processing/task-processing.module';
import { TASK_PROCESSING_QUEUE_NAME } from '../task-processing-queue/task-processing-queue.constants';
import { TaskProcessingQueueModule } from '../task-processing-queue/task-processing-queue.module';
import { TaskSheduleModule } from '../task-schedule/task-schedule.module';
import { UserAnswerModule } from '../user-answer/user-answer.module';

@Module({
	imports: [
		TaskProcessingModule,
		TaskProcessingQueueModule,
		ConfigModule,
		UserModule,
		TaskModule,
		TaskSheduleModule,
		OperationModule,
		NotificationModule,
		UserAnswerModule,
		BullModule.registerQueue({ name: TASK_PROCESSING_QUEUE_NAME }),
	],
	controllers: [],
	providers: [TaskProcessingQueueConsumer],
	exports: [],
})
export class TaskProcessingProcessorModule {};