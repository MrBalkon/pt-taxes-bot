import { Injectable } from '@nestjs/common';
import { TaskFieldsService } from '../task-fields/task-fields.service';
import { TaskService } from '../task/task.service';
import { TaskProcessingJobName } from '../task-processing-queue/task-processing.types';
import { UserAnswerService } from '../user-answer/user-answer.service';

@Injectable()
export class UserRequestDataService {
	constructor(
		private readonly taskService: TaskService,
		private readonly taskFieldsService: TaskFieldsService,
		private readonly userAnswerService: UserAnswerService
	) {}

	async getUserMissingQuestions(userId: number) {
		const task = this.taskService.getTaskBySystemName(TaskProcessingJobName.USER_REQUEST_DATA)
		const outputFields = await this.taskFieldsService.getOutputFieldsByUserAndTaskId(task.id)
		const fieldIds = Object.keys(outputFields).map((fieldId) => parseInt(fieldId))
		const userMetaFields = await this.userAnswerService.getUserAnswersPathsByFieldsIds(userId, fieldIds)

		const missingFields = Object.keys(outputFields).filter((fieldId) => {
			return !userMetaFields[fieldId]
		})

		return userMetaFields
	}
}