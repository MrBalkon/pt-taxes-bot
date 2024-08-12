import { Module } from '@nestjs/common';
import { TaskFieldsModule } from '../task-fields/task-fields.module';
import { UserRequestDataService } from './user-request-data.service';
import { TaskModule } from '../task/task.module';
import { UserAnswerModule } from '../user-answer/user-answer.module';

@Module({
	imports: [TaskModule, TaskFieldsModule, UserAnswerModule],
	controllers: [],
	providers: [UserRequestDataService],
	exports: [UserRequestDataService],
})
export class UserRequestDataModule {};