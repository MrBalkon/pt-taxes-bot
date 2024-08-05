import { Injectable } from "@nestjs/common";
import { Task, TaskProcessingPayload } from "../../../task-processing-queue/task-processing.types";

import { WebDriver } from 'selenium-webdriver';
import { UserService } from "src/modules/user/user.service";
import { SeleniumService } from "src/modules/selenium/selenium.service";
import { socialSecurityLogin, socialSecuriyGoMainPage } from "../../selenium-scenarios/seg-social/social-security.scenarios";
import { I18nService } from "nestjs-i18n";
import { QuestionService } from "src/modules/question/question.service";
import { financaisGoMainPage, financaisLogin } from "../../selenium-scenarios/financais/financais.scenarios";
import { ServiceUnavailableError, WrongCredentialsError } from "../../../task-processing-queue/task-processing-queue.error";
import { NotificaitonService } from "src/modules/notification/notification.service";
import { User } from "src/entities/user.entity";

@Injectable()
export class CheckCredentialsTask implements Task {
	constructor(
		private readonly questionService: QuestionService,
		private readonly seleniumService: SeleniumService,
		private readonly notificaitonService: NotificaitonService,
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
				const segSocialFields = await this.checkSegSocialCredentialsErrors(user, metaFields, driver)
				incorrectFields.push(...segSocialFields)

				if (!segSocialFields.length) {
					await this.questionService.saveAnswerByFieldSystemName(user.id, 'hasUserCheckedSegSocialCreds', { fieldValue: "yes" })
				} else {
					await this.questionService.deleteAnswer(user.id, 'hasUserCheckedSegSocialCreds')
				}
			}

			if (metaFields.nif && metaFields.financasPassword) {
				await financaisGoMainPage(driver)
				const finacasFields = await this.checkFinancasCredentialsErrors(user, metaFields, driver)
				incorrectFields.push(...finacasFields)

				if (!finacasFields?.length) {
					await this.questionService.saveAnswerByFieldSystemName(user.id, 'hasUserCheckedFinancasCreds', { fieldValue: "yes" })
				} else {
					await this.questionService.deleteAnswer(user.id, 'hasUserCheckedFinancasCreds')
				}
			}

			if (incorrectFields.length) {
				const fieldSystemNames = incorrectFields.map(field => field.fieldSystemName)
				const fieldNames = incorrectFields.map(field => field.fieldName)
				const text = `You've put wrong credentials for the following fields: ${fieldNames.join(', ')}`
				throw new WrongCredentialsError(text, fieldSystemNames)
			}
		} catch (e) {
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
