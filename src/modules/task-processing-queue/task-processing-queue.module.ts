import { Module } from '@nestjs/common';
import { TaskProcessingQueueService } from './task-processing-queue.service';
import { TASK_PROCESSING_QUEUE_NAME } from './task-processing-queue.constants';
import { BullModule } from '@nestjs/bull';
import { ConfigModule } from '../config/config.module';
import { UserModule } from '../user/user.module';
import { QuestionModule } from '../question/question.module';
import { TaskModule } from '../task/task.module';
import { OperationModule } from '../operation/operation.module';
import { NotificationModule } from '../notification/notification.module';
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
export class TaskProcessingQueueModule {}
