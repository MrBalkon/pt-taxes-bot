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
		const user = task.user
		const metaFields = await this.questionService.getUserMetaFields(task.userId,
			[
				{
					systemName: "niss",
					required: true,
				},
				{
					systemName: "segSocialPassword",
					required: true,
				},
				{
					systemName: "nif",
					required: true,
				},
				{
					systemName: "financasPassword",
					required: true,
				},
				"income"
			])

		return this.seleniumService.execute(async (driver) => this.runInSelenium(driver, user, metaFields))
	}

	async runInSelenium(driver: WebDriver, user: User, metaFields: Record<string, any>): Promise<void> {
		try {
			const incorrectFields = []
			if (metaFields.niss && metaFields.segSocialPassword) {
				await socialSecuriyGoMainPage(driver)
				incorrectFields.push(...await this.checkSegSocialCredentialsErrors(user, metaFields, driver))
			}

			if (metaFields.nif && metaFields.financasPassword) {
				await financaisGoMainPage(driver)
				incorrectFields.push(...await this.checkFinancasCredentialsErrors(user, metaFields, driver))
			}

			if (incorrectFields.length) {
				const fieldSystemNames = incorrectFields.map(field => field.fieldSystemName)
				const fieldNames = incorrectFields.map(field => field.fieldName)
				const text = `You've put wrong credentials for the following fields: ${fieldNames.join(', ')}`
				throw new WrongCredentialsError(text, fieldSystemNames)
			}
		} catch (e) {
			if (e instanceof ServiceUnavailableError) {
				// TODO add retry job after some time
				await this.notificaitonService.sendNotification(user, `${e.message}, please try again later.`)
			}
			throw e
		}
	}

	async checkSegSocialCredentialsErrors(user: User, metaFields: Record<string, any>, driver: WebDriver): Promise<string[]> {
		const { niss, segSocialPassword } = metaFields

		try {
			await this.notificaitonService.sendNotification(user, "We're trying to login to Seg Social with your credentials...")
			await socialSecurityLogin(driver, { niss: niss.fieldValue, password: segSocialPassword.fieldValue })

			await this.notificaitonService.sendNotification(user, 'All data filled correctly!')
			return []
		} catch (e) {
			return [niss, segSocialPassword]
		}
	}

	async checkFinancasCredentialsErrors(user: User, metaFields: Record<string, any>, driver: WebDriver): Promise<string[]> {
		const { nif, financasPassword } = metaFields

		try {
			await this.notificaitonService.sendNotification(user, "We're trying to login to Finanças with your credentials...")
			await financaisLogin(driver, { nif: nif.fieldValue, password: financasPassword.fieldValue })

			await this.notificaitonService.sendNotification(user, 'All data filled correctly!')
			return []
		} catch (e) {
			return [nif, financasPassword]
		}
	}
}
