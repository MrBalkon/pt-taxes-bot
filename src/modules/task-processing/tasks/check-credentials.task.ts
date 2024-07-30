import { Injectable, Logger } from "@nestjs/common";
import { Task, TaskProcessingPayload } from "../task-processing.types";

import { Builder, Browser, By, Key, until, Capabilities, WebDriver } from 'selenium-webdriver';
import { ConfigService } from "src/modules/config/config.service";
import { UserService } from "src/modules/user/user.service";
import { SeleniumService } from "src/modules/selenium/selenium.service";
import { sleep } from "../utils";
import { User } from "@sentry/node";
import { TelegramService } from "src/modules/telegram-config/telegram.service";
import { socialSecurityLogin, socialSecuriyGoMainPage } from "../selenium-scenarios/social-security.scenarios";
import { I18nService } from "nestjs-i18n";
import { UserWithMetaFields } from "src/modules/user/user.types";
import { QuestionService } from "src/modules/question/question.service";
import { financaisGoMainPage, financaisLogin } from "../selenium-scenarios/financais.scenarios";
import { SocialSecurityFillDeclarationTask } from "./social-security-fill-declaration.task";
import { IVAFillDeclarationTask } from "./iva-fill-declaration.task";
import { ServiceUnavailableError, WrongCredentialsError } from "../task-processing.error";

@Injectable()
export class CheckCredentialsTask implements Task {
	constructor(
		private readonly userService: UserService,
		private readonly questionService: QuestionService,
		private readonly seleniumService: SeleniumService,
		private readonly telegramService: TelegramService,
		private readonly i18n: I18nService
	) { }

	async run(task: TaskProcessingPayload): Promise<void> {
		const user = await this.userService.getFullUserMetaById(task.userId, task.type)

		await this.seleniumService.execute(async (driver) => this.runInSelenium(driver, user, task))
	}

	async runInSelenium(driver: WebDriver, user: UserWithMetaFields, task: TaskProcessingPayload): Promise<void> {
		try {
			// TODO separate error handling
			if (user.tasksMap[SocialSecurityFillDeclarationTask.name]) {
				await this.checkSegSocialCredentials(user, driver)
			}

			if (user.tasksMap[IVAFillDeclarationTask.name]) {
				await this.checkFinancasCredentials(user, driver)
			}
		} catch (e) {
			if (e instanceof ServiceUnavailableError) {
				// TODO add retry job after some time
				await this.telegramService.sendMessage(user.telegramId, `${e.message}, please try again later.`)
				return
			}
			if (e instanceof WrongCredentialsError) {
				await this.telegramService.sendMessage(user.telegramId, "You've put wrong credentials!", {
					reply_markup: {
						inline_keyboard: [
							[await this.telegramService.fillDataAction(user.id)],
						],
					},
					parse_mode: 'HTML'
				})
				return
			}

			throw e
		}
	}

	async checkSegSocialCredentials(user: UserWithMetaFields, driver: WebDriver): Promise<void> {
		const { niss, segSocialPassword } = user.metaFields

		try {
			await this.telegramService.sendMessage(user.telegramId, "We're trying to login to Seg Social with your credentials...")
			await socialSecuriyGoMainPage(driver)
			await socialSecurityLogin(driver, { niss, password: segSocialPassword })

			await this.telegramService.sendMessage(user.telegramId, 'All data filled correctly!')
		} catch (e) {
			if (e instanceof ServiceUnavailableError) {
				throw e
			}
			await this.questionService.deleteAnswer(user.id, 'niss')
			await this.questionService.deleteAnswer(user.id, 'segSocialPassword')
			throw new WrongCredentialsError()
		}
	}

	async checkFinancasCredentials(user: UserWithMetaFields, driver: WebDriver): Promise<void> {
		const { nif, password } = user.metaFields

		try {
			await this.telegramService.sendMessage(user.telegramId, "We're trying to login to Finanças with your credentials...")
			await financaisGoMainPage(driver)
			await financaisLogin(driver, { nif, password })

			await this.telegramService.sendMessage(user.telegramId, 'All data filled correctly!')
		} catch (e) {
			if (e instanceof ServiceUnavailableError) {
				throw e
			}
			await this.questionService.deleteAnswer(user.id, 'nif')
			await this.questionService.deleteAnswer(user.id, 'password')
			throw new WrongCredentialsError()
		}
	}
}
