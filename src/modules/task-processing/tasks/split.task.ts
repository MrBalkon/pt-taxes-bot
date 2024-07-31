import { Injectable } from "@nestjs/common";
import { Task, TaskProcessingJobName, TaskProcessingPayloadTemplate } from "../task-processing.types";

import { ConfigService } from "src/modules/config/config.service";
import { UserService } from "src/modules/user/user.service";
import { TelegramService } from "src/modules/telegram-config/telegram.service";
import { TaskProcessingQueueService } from "../services/task-processing.queue";
import { TaskService } from "src/modules/task/task.service";

export type SplitTaskPayload = TaskProcessingPayloadTemplate<{ splitTaskId: number }>

@Injectable()
export class SplitTask implements Task {
	constructor(
		private readonly userService: UserService,
		private readonly taskService: TaskService,
		private readonly taskProcessingQueueService: TaskProcessingQueueService,
	) {}
  async run(task: SplitTaskPayload): Promise<void> {
	const queueTask = await this.taskService.getTaskById(task.data.splitTaskId);
	const userIds = await this.userService.getUserIdsByTaskId(task.data.splitTaskId);

	const tasksPayloads = userIds.map((userId) => ({
		type: queueTask.systemName as TaskProcessingJobName,
		data: {
			userId
		}
	}))

	await this.taskProcessingQueueService.addQueueJobBulk(tasksPayloads)
  }
}
