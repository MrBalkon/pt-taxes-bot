import { Injectable } from "@nestjs/common";
import { Task, TaskProcessingPayload } from "../../../task-processing-queue/task-processing.types";

import { WebDriver } from 'selenium-webdriver';
import { SeleniumService } from "src/modules/selenium/selenium.service";
import { TelegramService } from "src/modules/telegram-config/telegram.service";
import { I18nService } from "nestjs-i18n";
import { User } from "src/entities/user.entity";
import { financaisGoMainPage, financaisLogin } from "../../selenium-scenarios/financais/financais.scenarios";
import { getPreviousQuarter } from "src/utils/date";
import { fillPeriodicIVA, findExistingDeclarations, goConsultarPeriodicIVA, goFillDeclarationPage } from "../../selenium-scenarios/financais/fill-periodc-iva";
import { NotificaitonService } from "src/modules/notification/notification.service";

@Injectable()
export class IVAFillDeclarationTask implements Task {
	constructor(
		private readonly seleniumService: SeleniumService,
		private readonly notificationService: NotificaitonService,
		private readonly i18n: I18nService
	) {}
  async run(task: TaskProcessingPayload): Promise<void> {
	const user = task.user
	const metaFields = task.metaFields

	await this.seleniumService.execute(async (driver) => this.runInSelenium(driver, user, metaFields, task))
  }

  async runInSelenium(driver: WebDriver, user: User, metaFields: Record<string, any>, task: TaskProcessingPayload): Promise<void> {
	const { nif, financasPassword } = metaFields
	const quarterToFill = getPreviousQuarter()

	await financaisGoMainPage(driver)

	await financaisLogin(driver, {
		nif: nif.fieldValue,
		password: financasPassword.fieldValue
	})

	await goConsultarPeriodicIVA(driver)

	const declarations = await findExistingDeclarations(driver)

	// TODO uncomment after tests
	// if (declarations.find(declaration => declaration.declarationQuarter === quarterToFill)) {
	// 	await this.notificationService.sendNotification(user, `🔔 We've tried to submit your Periodic IVA declaration for ${quarterToFill} quarter but it seems you've already submitted it!`)
	// 	return
	// }

	await goFillDeclarationPage(driver)

	await fillPeriodicIVA(driver, { quarter: quarterToFill })

	await this.notificationService.sendNotification(user, 'Successfully submitted you declaration!')
  }
}
