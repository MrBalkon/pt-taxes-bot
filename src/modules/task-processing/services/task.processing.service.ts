import { Injectable, Logger } from '@nestjs/common';
import { Task, TaskProcessingPayload } from '../task-processing.types';
import { SocialSecurityTask } from '../tasks/social-security.task';
import { TelegramNotifyTask } from '../tasks/telegram-notify.task';
import { CheckCredentialsTask } from '../tasks/check-credentials.task';
import { SocialSecurityFillDeclarationTask } from '../tasks/social-security-fill-declaration.task';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class TaskProcessingService {
	private logger = new Logger(TaskProcessingService.name);
	constructor(
		private readonly socialsecuritytask: SocialSecurityTask,
		private readonly telegramnotifytask: TelegramNotifyTask,
		private readonly checkcredentialstask: CheckCredentialsTask,
		private readonly socialsecurityfilldeclarationtask: SocialSecurityFillDeclarationTask,
	) {}

	async processTask(task: TaskProcessingPayload): Promise<void> {
		this.logger.log(`[${task.taskUid}] Processing task: ${task.type}`);

		const taskService = this[task.type.toLowerCase()];

		if (!taskService) {
			throw new Error(`Task service not found: ${task.type}`);
		}

		await taskService.run(task);

		this.logger.log(`[${task.taskUid}] Task processed`);
	}
}