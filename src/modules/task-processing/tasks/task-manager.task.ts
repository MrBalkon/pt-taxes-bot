import { Injectable, Logger } from "@nestjs/common";
import { Task, TaskProcessingJobName, TaskProcessingPayload } from "../task-processing.types";

import { UserService } from "src/modules/user/user.service";
import { SeleniumService } from "src/modules/selenium/selenium.service";
import { I18nService } from "nestjs-i18n";
import { QuestionService } from "src/modules/question/question.service";
import { NotificaitonService } from "src/modules/notification/notification.service";
import { User } from "src/entities/user.entity";
import { Task as DBTask } from "src/entities/task.entity";
import { TaskService } from "src/modules/task/task.service";
import { SubscriptionService } from "src/modules/subscription/subscription.service";
import { TaskLifespanType, TaskType } from "src/entities/task.entity";
import { FieldService } from "src/modules/field/field.service";
import { TaskProcessingQueueService } from "../services/task-processing.queue";

@Injectable()
export class TaskManagerService implements Task {
	private readonly logger = new Logger(TaskManagerService.name);
	constructor(
		private readonly userService: UserService,
		private readonly questionService: QuestionService,
		private readonly seleniumService: SeleniumService,
		private readonly notificaitonService: NotificaitonService,
		private readonly i18n: I18nService,
		private readonly taskService: TaskService,
		private readonly subscriptionService: SubscriptionService,
		private readonly fieldService: FieldService,
		private readonly taskProcessingQueueService: TaskProcessingQueueService,
	) { }

	async run(taskPayload: TaskProcessingPayload): Promise<void> {
		const user = taskPayload.user
		const subscription = await this.subscriptionService.findActiveUserSubscription(user.id)

		const tasks = await this.getNextTasksToExecute(user)

		if (!tasks.length) {
			this.logger.log(`[${taskPayload.taskUid}] No tasks found for user ${user.id}`)
			return;
		}

		const tasksPayloads = tasks.map(task => {
			return {
				userId: user.id,
				type: task.systemName as TaskProcessingJobName,
				parentOperationId: taskPayload.taskUid,
				data: {}
			}
		})

		await this.taskProcessingQueueService.addQueueJobBulk(tasksPayloads)
	}

	async getNextTasksToExecute(user: User) {
		const tasks = await this.taskService.getFullTasksByUserId(user.id)
		const taskIdsMap = tasks.reduce<Record<number, DBTask>>((acc, task) => {
			acc[task.id] = task;
			return acc;
		}, {})

		const actionTasks = tasks.filter(task => task.type === TaskType.ACTION);
		const metaFields = await this.questionService.getUserAllMetaFieldsByTaskIds(
			user.id,
			tasks.map(task => task.id)
		)

		const neededFieldIds = tasks
			.map(task => {
				const fieldsIds = task.taskFields.filter(
					field => field.isRequired
				)
				.map(taskField => taskField.fieldId)

				return fieldsIds.filter(fieldId => {
					return !metaFields?.[fieldId]
				})
			})
			.filter(fieldIds => fieldIds.length);

		if (!neededFieldIds.flat().length) {
			return actionTasks.filter(task => task.lifespanType === TaskLifespanType.ON_DEMAND);
		}

		const dataExtractionTasks = tasks.filter(task => task.type === TaskType.DATA_EXTRACTION);

		const taskMatchesCountMap = neededFieldIds.reduce<Record<number, number>>((acc, neededIdsGroup: number[]) => {
			const matchedTasks = dataExtractionTasks.filter(task => {
				return neededIdsGroup.some(fieldId => task.outputFields.some(taskField => taskField.fieldId === fieldId));
			})

			matchedTasks.forEach(task => {
				if (!acc[task.id]) {
					acc[task.id] = 0;
				}

				acc[task.id]++;
			})

			return acc;
		}, {})

		const sortedTasks = Object.entries(taskMatchesCountMap)
			.sort((a, b) => b[1] - a[1])
			.reduce((acc, item, index) => {
				if (index == 0) {
					acc.push(item)
					return acc
				}

				const previousAcc = acc[acc.length - 1];
				if (previousAcc[1] === item[1]) {
					acc.push(item)
				}

				return acc
			}, [])
		const priorityTasks = sortedTasks.map(([taskId]) => taskIdsMap[taskId])

		return priorityTasks;
	}
}
