import { Injectable, Logger } from '@nestjs/common';
import { TaskProcessingPayload } from '../task-processing.types';
import { SocialSecurityTask } from '../tasks/social-security.task';
import { TelegramNotifyTask } from '../tasks/telegram-notify.task';
import { CheckCredentialsTask } from '../tasks/check-credentials.task';
import { SocialSecurityFillDeclarationTask } from '../tasks/social-security-fill-declaration.task';
import { ModuleRef } from '@nestjs/core';
import { SplitTask } from '../tasks/split.task';
import { TaskService } from 'src/modules/task/task.service';
import { DynamicTask } from '../tasks/dynamic-selenium/dynamic-selenium.task';
import { Task } from 'src/entities/task.entity';

@Injectable()
export class TaskProcessingService {
	private logger = new Logger(TaskProcessingService.name);
	constructor(
		private readonly socialsecuritytask: SocialSecurityTask,
		private readonly telegramnotifytask: TelegramNotifyTask,
		private readonly checkcredentialstask: CheckCredentialsTask,
		private readonly socialsecurityfilldeclarationtask: SocialSecurityFillDeclarationTask,
		private readonly splittask: SplitTask,
		private readonly dynamicTask: DynamicTask,
		private readonly taskService: TaskService
	) {}

	async processTask(task: TaskProcessingPayload): Promise<void> {
		this.logger.log(`[${task.taskUid}] Processing task: ${task.type}`);

		const dbTask = await this.taskService.getTaskBySystemNameOrFail(task.type);
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
}