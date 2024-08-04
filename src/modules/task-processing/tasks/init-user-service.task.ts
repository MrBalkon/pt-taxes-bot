import { Injectable, Logger } from "@nestjs/common";
import { Task, TaskProcessingPayload, TaskProcessingResult, TaskProcessingResultStatus } from "../task-processing.types";

import { Builder, Browser, By, Key, until, Capabilities, WebDriver } from 'selenium-webdriver';
import { ConfigService } from "src/modules/config/config.service";
import { UserService } from "src/modules/user/user.service";
import { SeleniumService } from "src/modules/selenium/selenium.service";
import { sleep } from "../utils";
import { TelegramService } from "src/modules/telegram-config/telegram.service";
import { socialSecurityLogin, socialSecuriyGoMainPage } from "../selenium-scenarios/seg-social/social-security.scenarios";
import { I18nService } from "nestjs-i18n";
import { QuestionService } from "src/modules/question/question.service";
import { financaisGoMainPage, financaisLogin } from "../selenium-scenarios/financais/financais.scenarios";
import { SocialSecurityFillDeclarationTask } from "./social-security-fill-declaration.task";
import { IVAFillDeclarationTask } from "./iva-fill-declaration.task";
import { ServiceUnavailableError, WrongCredentialsError } from "../task-processing.error";
import { NotificaitonService } from "src/modules/notification/notification.service";
import { NotificationAction } from "src/modules/notification/notification.types";
import { User } from "src/entities/user.entity";
import { TaskService } from "src/modules/task/task.service";
import { SubscriptionService } from "src/modules/subscription/subscription.service";

@Injectable()
export class InitUserService implements Task {
	constructor(
		private readonly userService: UserService,
		private readonly questionService: QuestionService,
		private readonly seleniumService: SeleniumService,
		private readonly notificaitonService: NotificaitonService,
		private readonly i18n: I18nService,
		private readonly taskService: TaskService,
		private readonly subscriptionService: SubscriptionService
	) { }

	async run(task: TaskProcessingPayload): Promise<void> {
		const user = task.user

		const metaFields = await this.questionService.getUserMetaFields(
			task.userId,
			[]
		)
		const subscription = await this.subscriptionService.findActiveUserSubscription(user.id)
		const tasks = await this.taskService.getTasksByUserId(user.id)

		// check if user has missed sheduled tasks
	}
}
