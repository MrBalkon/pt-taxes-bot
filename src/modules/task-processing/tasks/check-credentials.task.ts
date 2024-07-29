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

@Injectable()
export class CheckCredentialsTask implements Task {
	constructor(
		private readonly userService: UserService,
		private readonly seleniumService: SeleniumService,
		private readonly telegramService: TelegramService,
		private readonly i18n: I18nService
	) { }

	async run(task: TaskProcessingPayload): Promise<void> {
		const user = await this.userService.getUserById(task.userId)

		await this.seleniumService.execute(async (driver) => this.runInSelenium(driver, user, task))
	}

	async runInSelenium(driver: WebDriver, user: User, task: TaskProcessingPayload): Promise<void> {
		const { niss, segSocialPassword } = user.metadata

		try {
			await this.telegramService.sendMessage(user.telegramId, "We're trying to login to Seg Social with your credentials...")
			await socialSecuriyGoMainPage(driver)
			await socialSecurityLogin(driver, { niss, password: segSocialPassword })

			await this.telegramService.sendMessage(user.telegramId, 'All data filled correctly!')
		} catch (e) {
			await this.telegramService.sendMessage(user.telegramId, "You've put wrong credentials!", {
				reply_markup: {
					inline_keyboard: [
						[{text: this.i18n.t("t.home.fillData"), callback_data: 'homeScene.fillDataAction'}],
					],
				},
				parse_mode: 'HTML'
			})
		}
	}
}
