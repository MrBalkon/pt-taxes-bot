import { Injectable } from "@nestjs/common";
import { Task, TaskProcessingPayload, TaskProcessingPayloadTemplate } from "../../task-processing-queue/task-processing.types";

import { Builder, Browser, By, Key, until, Capabilities } from 'selenium-webdriver';
import { ConfigService } from "src/modules/config/config.service";
import { UserService } from "src/modules/user/user.service";
import { SeleniumService } from "src/modules/selenium/selenium.service";
import { InjectBot } from "nestjs-telegraf";
import { TelegramService } from "src/modules/telegram-config/telegram.service";

export type TelegramNotifyTaskPayload = TaskProcessingPayloadTemplate<{ text: string }>

@Injectable()
export class TelegramNotifyTask implements Task {
	constructor(
		private readonly configService: ConfigService,
		private readonly userService: UserService,
		private readonly telegramService: TelegramService,
	) {}
  async run(task: TelegramNotifyTaskPayload): Promise<void> {
	const user = await this.userService.getUserById(task.userId)

	await this.telegramService.sendMessage(user.telegramId, task.data.text)
  }
}
