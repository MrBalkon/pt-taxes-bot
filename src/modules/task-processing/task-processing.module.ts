import { Module, forwardRef } from '@nestjs/common';;
import { TaskProcessingService } from './task.processing.service';
import { ConfigModule } from '../config/config.module';
import { UserModule } from '../user/user.module';
import { SeleniumModule } from '../selenium/selenium.module';
import { TelegamConfigModule } from '../telegram-config/telegram-config.module';
import { InjectDynamicProviders } from 'nestjs-dynamic-providers';
import { QuestionModule } from '../question/question.module';
import { TaskModule } from '../task/task.module';
import { OperationModule } from '../operation/operation.module';
import { ExecutionScenarioModule } from '../execution-scenario/execution-scenario.module';
import { ExecutionCommandModule } from '../execution-command/execution-command.module';
import { NotificationModule } from '../notification/notification.module';
import { SubscriptionModule } from '../subscription/subscription.module';
import { FieldModule } from '../field/field.module';
import { TaskProcessingQueueModule } from '../task-processing-queue/task-processing-queue.module';

@InjectDynamicProviders('dist/**/*.task.js')
@Module({
	imports: [
		ConfigModule,
		UserModule,
		SeleniumModule,
		TelegamConfigModule,
		QuestionModule,
		TaskModule,
		OperationModule,
		ExecutionCommandModule,
		ExecutionScenarioModule,
		NotificationModule,
		SubscriptionModule,
		FieldModule,
		forwardRef(() => TaskProcessingQueueModule)
	],
	controllers: [],
	providers: [TaskProcessingService],
	exports: [TaskProcessingService],
})
export class TaskProcessingModule {};