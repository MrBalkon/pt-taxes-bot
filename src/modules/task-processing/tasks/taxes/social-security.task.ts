import { Injectable } from "@nestjs/common";
import { Task, TaskProcessingPayload } from "../../../task-processing-queue/task-processing.types";

import { Builder, Browser, By, Key, until, Capabilities } from 'selenium-webdriver';
import { ConfigService } from "src/modules/config/config.service";
import { UserService } from "src/modules/user/user.service";
import { SeleniumService } from "src/modules/selenium/selenium.service";
import { TelegramNotifyTask } from "../telegram-notify.task";

@Injectable()
export class SocialSecurityTask implements Task {
	constructor(
		private readonly configService: ConfigService,
		private readonly userService: UserService,
		private readonly seleniumService: SeleniumService,
		private readonly telegramNotifyTask: TelegramNotifyTask,
	) {}
  async run(task: TaskProcessingPayload): Promise<void> {
	const user = await this.userService.getUserById(task.userId)
	// const { niss, segSocialPassword } = user.metadata

	// await this.seleniumService.execute(async (driver) => {
	// 	await driver.get('https://app.seg-social.pt/ptss/')
	// 	// await driver.wait(until.elementIsVisible(By.name('q')), 1000)
	// 	// wait unit q element is visible
	// 	await new Promise<void>((resolve, reject) => {
	// 			setTimeout(() => {
	// 				resolve()
	// 			}, 10000)
	// 		}
	// 	)

	// 	const nameInput = await driver.findElement(By.name('username'))
	// 	await nameInput.sendKeys(niss)

	// 	const passInput = await driver.findElement(By.name('password'))
	// 	await passInput.sendKeys(segSocialPassword, Key.RETURN)

	// 	// const submitButton = await driver.findElement(By.name('submitBtn'))
	// 	// await submitButton.click()
	// })

	await this.telegramNotifyTask.run({
		...task,
		data: {
			text: 'Finished with login to Seg Social!'
		}
	})
  }
}
