import { Injectable } from "@nestjs/common";
import { Task, TaskProcessingPayload } from "../task-processing.types";

import { WebDriver } from 'selenium-webdriver';
import { ConfigService } from "src/modules/config/config.service";
import { UserService } from "src/modules/user/user.service";
import { SeleniumService } from "src/modules/selenium/selenium.service";
import { TelegramService } from "src/modules/telegram-config/telegram.service";
import { socialSecurityLogin, socialSecuriyGoMainPage } from "../selenium-scenarios/seg-social/social-security.scenarios";
import { I18nService } from "nestjs-i18n";
import { User } from "src/entities/user.entity";

@Injectable()
export class IVAFillDeclarationTask implements Task {
	constructor(
		private readonly configService: ConfigService,
		private readonly userService: UserService,
		private readonly seleniumService: SeleniumService,
		private readonly telegramService: TelegramService,
		private readonly i18n: I18nService
	) {}
  async run(task: TaskProcessingPayload): Promise<void> {
	const user = await this.userService.getUserById(task.userId)

	await this.seleniumService.execute(async (driver) => this.runInSelenium(driver, user, task))

	await this.telegramService.sendMessage(user.telegramId, 'Finished with login to Seg Social!')
  }

  async runInSelenium(driver: WebDriver, user: User, task: TaskProcessingPayload): Promise<void> {
	// TODO switch to user fields
	const { niss, segSocialPassword } = { niss: '12345678901', segSocialPassword: 'password' }

	try {
		await socialSecuriyGoMainPage(driver)
		await socialSecurityLogin(driver, { niss, password: segSocialPassword })

		// await socialSecurityFillDeclaration(driver)

		await this.telegramService.sendMessage(user.telegramId, 'Successfully submitted you declaration!')
	} catch (e) {
		await this.telegramService.sendMessage(user.telegramId, "Something went wrong with your declaration", {
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
