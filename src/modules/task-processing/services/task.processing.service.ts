import { Injectable, Logger } from '@nestjs/common';
import { TaskProcessingPayload } from '../task-processing.types';
import { SocialSecurityTask } from '../tasks/social-security.task';
import { TelegramNotifyTask } from '../tasks/telegram-notify.task';
import { CheckCredentialsTask } from '../tasks/check-credentials.task';
import { SocialSecurityFillDeclarationTask } from '../tasks/social-security-fill-declaration.task';
import { SplitTask } from '../tasks/split.task';
import { TaskService } from 'src/modules/task/task.service';
import { DynamicTask } from '../tasks/dynamic-selenium/dynamic-selenium.task';
import { Task } from 'src/entities/task.entity';
import { FinancaisFillData } from '../tasks/financais-fill-data.task';
import { TaskManagerService } from '../tasks/task-manager.task';
import { QuestionService } from 'src/modules/question/question.service';
import { TaskInputFieldsException } from '../task-processing.error';
import { TaskFieldTimeRangeType } from 'src/entities/task-field.entity';
import { getPreviousQuarterMonths, getPreviousQuarterYear, getPreviousYear } from 'src/utils/date';
import { UserRequestData } from '../tasks/user-request-data.task';

@Injectable()
export class TaskProcessingService {
	private logger = new Logger(TaskProcessingService.name);
	constructor(
		private readonly socialsecuritytask: SocialSecurityTask,
		private readonly telegramnotifytask: TelegramNotifyTask,
		private readonly checkcredentialstask: CheckCredentialsTask,
		private readonly socialsecurityfilldeclarationtask: SocialSecurityFillDeclarationTask,
		private readonly splittask: SplitTask,
		private readonly financaisfilldata: FinancaisFillData,
		private readonly taskmanagerservice: TaskManagerService,
		private readonly userrequestdata: UserRequestData,
		private readonly dynamicTask: DynamicTask,
		private readonly taskService: TaskService,
		private readonly questionService: QuestionService,
	) {}

	async processTask(task: TaskProcessingPayload): Promise<void> {
		this.logger.log(`[${task.taskUid}] Processing task: ${task.type}`);

		const dbTask = await this.taskService.getTaskBySystemNameOrFail(task.type);
		task.metaFields = await this.injectFields(task, dbTask);
		const taskExecutionService = this.getTaskExecutionService(dbTask);

		if (!taskExecutionService) {
			throw new Error(`Task service not found: ${task.type}`);
		}

		await taskExecutionService.run(task);

		this.logger.log(`[${task.taskUid}] Task processed`);
	}

	private getTaskExecutionService(task: Task) {
		if (task.isDynamic) {
			return this.dynamicTask;
		}

		return this[task.systemName.toLowerCase()];
	}

	private async injectFields(queueTask: TaskProcessingPayload, dbTask: Task): Promise<Record<string, any>> {
		// TODO switch to using global meta fields
		if (!dbTask.taskFields?.length || !queueTask.userId) {
			return {};
		}

		const fieldIds = dbTask.taskFields.map((taskField) => taskField.fieldId);
		const metaFields = await this.questionService.getUserMetaFieldsByIds(queueTask.userId, fieldIds)

		// validate if all fields are present
		const missingFields = dbTask.taskFields.filter((taskField) => {
			const key = taskField.field.systemName
			const existingMetaField = metaFields[key]
			if (!existingMetaField) {
				return true;
			}

			switch (taskField.timeRangeType) {
				case TaskFieldTimeRangeType.PREVIOUS_QUARTER:
					const previousQuarterYear = getPreviousQuarterYear();
					const previousQuarterMonth = getPreviousQuarterMonths();
					return previousQuarterMonth.every((month) => {
						return existingMetaField[previousQuarterYear][month];
					})
				case TaskFieldTimeRangeType.PREVIOUS_YEAR:
					const previousYear = getPreviousYear()
					return Object.values(existingMetaField[previousYear])?.length === 12;
				default:
					return false
			}
		});

		if (missingFields.length) {
			throw new TaskInputFieldsException(missingFields);
		}

		return metaFields;
	}
}

// dump for tasks_fields:
// 1	1
// 3	1
// 4	1
// 7	1
// 2	2
// 1	3
// 3	3
// 5	3
// 6	3
// 5	5
// 6	5
// 18	5