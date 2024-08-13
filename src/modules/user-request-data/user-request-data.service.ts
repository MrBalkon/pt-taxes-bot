import { Injectable } from '@nestjs/common';
import { TaskFieldsService } from '../task-fields/task-fields.service';
import { TaskService } from '../task/task.service';
import { TaskProcessingJobName } from '../task-processing-queue/task-processing.types';
import { UserAnswerService } from '../user-answer/user-answer.service';
import { QuestionService } from '../question/question.service';

@Injectable()
export class UserRequestDataService {
	constructor(
		private readonly taskService: TaskService,
		private readonly taskFieldsService: TaskFieldsService,
		private readonly userAnswerService: UserAnswerService,
		private readonly questionService: QuestionService,
	) {}

	async getUserMissingQuestions(userId: number) {
		const task = this.taskService.getTaskBySystemName(TaskProcessingJobName.USER_REQUEST_DATA)
		const outputFields = await this.taskFieldsService.getOutputFieldsByUserAndTaskId(task.id)
		const userMetaFields = await this.userAnswerService.getUserAllMetaFieldsByTaskIds(userId, [task.id])

		const missingFields = Object.keys(outputFields).filter((fieldId) => {
			return !userMetaFields[fieldId]
		}).map((fieldId) => parseInt(fieldId))

		const questions = await this.questionService.getQuestionsByFieldIds(missingFields)

		return questions
	}

	async getUserAnswersByFieldSystemName(userId: number, fieldSystemName: string) {
		return this.userAnswerService.getUserAnswersByFieldSystemName(userId, fieldSystemName)
	}
}