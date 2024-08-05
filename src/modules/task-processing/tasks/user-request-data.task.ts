import { Injectable } from "@nestjs/common";
import { Task, TaskProcessingPayload } from "../../task-processing-queue/task-processing.types";

import { NotificaitonService } from "src/modules/notification/notification.service";
import { NotificationAction } from "src/modules/notification/notification.types";

@Injectable()
export class UserRequestData implements Task {
	constructor(
		private readonly notificaitonService: NotificaitonService,
	) { }

	async run(task: TaskProcessingPayload): Promise<void> {
		const user = task.user
		const message = "Please, fill information for further processing"
		await this.notificaitonService.sendNotification(user, message, {
			action: NotificationAction.REQUEST_DATA,
		})
	}
}
