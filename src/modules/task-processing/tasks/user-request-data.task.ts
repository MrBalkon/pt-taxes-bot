import { Injectable, Logger } from "@nestjs/common";
import { Task, TaskProcessingPayload, TaskProcessingResult, TaskProcessingResultStatus } from "../../task-processing-queue/task-processing.types";

import { Builder, Browser, By, Key, until, Capabilities, WebDriver } from 'selenium-webdriver';
import { ConfigService } from "src/modules/config/config.service";
import { UserService } from "src/modules/user/user.service";
import { SeleniumService } from "src/modules/selenium/selenium.service";
import { sleep } from "../../task-processing-queue/utils";
import { TelegramService } from "src/modules/telegram-config/telegram.service";
import { socialSecurityLogin, socialSecuriyGoMainPage } from "../selenium-scenarios/seg-social/social-security.scenarios";
import { I18nService } from "nestjs-i18n";
import { QuestionService } from "src/modules/question/question.service";
import { financaisGoMainPage, financaisLogin } from "../selenium-scenarios/financais/financais.scenarios";
import { SocialSecurityFillDeclarationTask } from "./social-security-fill-declaration.task";
import { IVAFillDeclarationTask } from "./iva-fill-declaration.task";
import { ServiceUnavailableError, WrongCredentialsError } from "../../task-processing-queue/task-processing.error";
import { NotificaitonService } from "src/modules/notification/notification.service";
import { NotificationAction } from "src/modules/notification/notification.types";
import { User } from "src/entities/user.entity";

@Injectable()
export class UserRequestData implements Task {
	constructor(
		private readonly notificaitonService: NotificaitonService,
	) { }

	async run(task: TaskProcessingPayload): Promise<void> {
		const user = task.user
		await this.notificaitonService.sendNotification(user, "Please, fill needed", {
			action: NotificationAction.REQUEST_DATA,
		})
	}
}
