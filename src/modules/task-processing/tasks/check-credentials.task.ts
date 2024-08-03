import { Injectable, Logger } from "@nestjs/common";
import { Task, TaskProcessingPayload, TaskProcessingResult, TaskProcessingResultStatus } from "../task-processing.types";

import { Builder, Browser, By, Key, until, Capabilities, WebDriver } from 'selenium-webdriver';
import { ConfigService } from "src/modules/config/config.service";
import { UserService } from "src/modules/user/user.service";
import { SeleniumService } from "src/modules/selenium/selenium.service";
import { sleep } from "../utils";
import { User } from "@sentry/node";
import { TelegramService } from "src/modules/telegram-config/telegram.service";
import { socialSecurityLogin, socialSecuriyGoMainPage } from "../selenium-scenarios/seg-social/social-security.scenarios";
import { I18nService } from "nestjs-i18n";
import { UserWithMetaFields } from "src/modules/user/user.types";
import { QuestionService } from "src/modules/question/question.service";
import { financaisGoMainPage, financaisLogin } from "../selenium-scenarios/financais/financais.scenarios";
import { SocialSecurityFillDeclarationTask } from "./social-security-fill-declaration.task";
import { IVAFillDeclarationTask } from "./iva-fill-declaration.task";
import { ServiceUnavailableError, WrongCredentialsError } from "../task-processing.error";
import { NotificaitonService } from "src/modules/notification/notification.service";
import { NotificationAction } from "src/modules/notification/notification.types";

@Injectable()
export class CheckCredentialsTask implements Task {
	constructor(
		private readonly userService: UserService,
		private readonly questionService: QuestionService,
		private readonly seleniumService: SeleniumService,
		private readonly notificaitonService: NotificaitonService,
		private readonly i18n: I18nService
	) { }

	async run(task: TaskProcessingPayload): Promise<void> {
		const user = await this.userService.getFullUserMetaById(
			task.userId,
			["niss", "segSocialPassword", "nif", "financasPassword", "income"]
		)

		return this.seleniumService.execute(async (driver) => this.runInSelenium(driver, user, task))
	}

	async runInSelenium(driver: WebDriver, user: UserWithMetaFields, task: TaskProcessingPayload): Promise<void> {
		try {
			const incorrectFields = []
			if (user.metaFields.niss && user.metaFields.segSocialPassword) {
				await socialSecuriyGoMainPage(driver)
				incorrectFields.push(...await this.checkSegSocialCredentialsErrors(user, driver))
			}

			if (user.metaFields.nif && user.metaFields.financasPassword) {
				await financaisGoMainPage(driver)
				incorrectFields.push(...await this.checkFinancasCredentialsErrors(user, driver))
			}

			if (incorrectFields.length) {
				await this.notificaitonService.sendNotification(user, "You've put wrong credentials for the following fields: " + incorrectFields.join(', '), {
					action: NotificationAction.REQUEST_CREDENTIALS
				})
			}
		} catch (e) {
			if (e instanceof ServiceUnavailableError) {
				// TODO add retry job after some time
				await this.notificaitonService.sendNotification(user, `${e.message}, please try again later.`)
			}
			throw e
		}
	}

	async checkSegSocialCredentialsErrors(user: UserWithMetaFields, driver: WebDriver): Promise<string[]> {
		const { niss, segSocialPassword } = user.metaFields

		try {
			await this.notificaitonService.sendNotification(user, "We're trying to login to Seg Social with your credentials...")
			await socialSecurityLogin(driver, { niss: niss.fieldValue, password: segSocialPassword.fieldValue })

			await this.notificaitonService.sendNotification(user, 'All data filled correctly!')
			return []
		} catch (e) {
			await this.questionService.deleteAnswerBulk(user.id, [niss.fieldSystemName, segSocialPassword.fieldSystemName])
			return [niss.fieldName, segSocialPassword.fieldName]
		}
	}

	async checkFinancasCredentialsErrors(user: UserWithMetaFields, driver: WebDriver): Promise<string[]> {
		const { nif, financasPassword } = user.metaFields

		try {
			await this.notificaitonService.sendNotification(user, "We're trying to login to Finanças with your credentials...")
			await financaisLogin(driver, { nif: nif.fieldValue, password: financasPassword.fieldValue })

			await this.notificaitonService.sendNotification(user, 'All data filled correctly!')
		} catch (e) {
			await this.questionService.deleteAnswerBulk(user.id, [nif.fieldSystemName, financasPassword.fieldSystemName])
			return [nif.fieldName, financasPassword.fieldName]
		}
	}
}
