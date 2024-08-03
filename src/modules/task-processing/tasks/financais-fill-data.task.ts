import { Injectable } from "@nestjs/common";
import { Task, TaskProcessingPayload } from "../task-processing.types";

import { WebDriver } from 'selenium-webdriver';
import { UserService } from "src/modules/user/user.service";
import { SeleniumService } from "src/modules/selenium/selenium.service";
import { TelegramService } from "src/modules/telegram-config/telegram.service";
import { I18nService } from "nestjs-i18n";
import { financaisGoMainPage, financaisLogin, getActivityStartDate, gotToAtividadePage, retrieveCategoryData } from "../selenium-scenarios/financais/financais.scenarios";
import { UserWithMetaFields } from "src/modules/user/user.types";
import { QuestionService } from "src/modules/question/question.service";
import { DateTime } from "luxon";
import { goFaturaVerdePage, retrieveFaturaVerdeIncome } from "../selenium-scenarios/financais/retrieve-fatura-verde.scenario";
import { DownloadFinancaisFaturaTable, DownloadFinancaisFaturaTableCSituaca, DownloadFinancaisFaturaTableTipoRecibo } from "../selenium-scenarios/financais/download-financais";

@Injectable()
export class FinancaisFillData implements Task {
	constructor(
		private readonly userService: UserService,
		private readonly seleniumService: SeleniumService,
		private readonly telegramService: TelegramService,
		private readonly questionService: QuestionService,
		private readonly i18n: I18nService
	) {}
  async run(task: TaskProcessingPayload): Promise<void> {
	const user = await this.userService.getFullUserMetaById(task.userId, [
		"nif",
		"financasPassword",
		"incomeReciebaVerde",
		"ivaFaturaRecieba",
		"irsFaturaRecieba",
	])

	await this.seleniumService.execute(async (driver) => this.runInSelenium(driver, user, task))

	// await this.telegramService.sendMessage(user.telegramId, 'Finished with login to Seg Social!')
  }

  async runInSelenium(driver: WebDriver, user: UserWithMetaFields, task: TaskProcessingPayload): Promise<void> {
	const { nif, financasPassword } = user.metaFields

	try {
		await financaisGoMainPage(driver)

		await financaisLogin(driver, {
			nif: nif.fieldValue,
			password: financasPassword.fieldValue
		})

		// Go to Atividade page
		await gotToAtividadePage(driver)

		const category = await retrieveCategoryData(driver)
		await this.questionService.saveAnswerByFieldSystemName(user.id, 'workCategory', { fieldValue: category })

		const activityStartDate = await getActivityStartDate(driver)
		await this.questionService.saveAnswerByFieldSystemName(user.id, 'activityStartDate', { fieldValue: activityStartDate })

		if (category != 'B' ) {
			return
		}

		// Go to Fatura Verde page
		await goFaturaVerdePage(driver)

		// get end date for fatura verde in YYYY-MM-DD format string, where date is today
		const endDateObj = DateTime.local()
		const endDate = endDateObj.toISODate()
		// get startDate 12 months before endDate
		const startDate = endDateObj.minus({ months: 12 }).toISODate()

		const retrieveDataArgs: DownloadFinancaisFaturaTable = {
			nif: nif.fieldValue,
			dataEmissaoInicio: startDate,
			dataEmissaoFim: endDate,
			cSituaca: DownloadFinancaisFaturaTableCSituaca.EMITIDO,
			tipoRecibo: DownloadFinancaisFaturaTableTipoRecibo.FATURA_RECIBO
		}

		const data = await retrieveFaturaVerdeIncome(driver, retrieveDataArgs)

		console.log('result')

		const fieldsToFill = ["incomeReciebaVerde", "ivaFaturaRecieba", "irsFaturaRecieba"]
		const answers = data.reduce((acc, item) => {
			fieldsToFill.forEach((field) => {
				if (!item[field]) {
					return
				}
				acc.push({
					fieldSystemName: field,
					fieldValue: item[field],
					year: item.year,
					month: item.month
				})
			})
			return acc
		}, [])

		await this.questionService.saveAnswersBulkByFieldSystemName(user.id, answers)
	} catch (e) {
		await this.telegramService.sendMessage(user.telegramId, "Something went wrong with your declaration", {
			reply_markup: {
				inline_keyboard: [
					[{text: this.i18n.t("t.home.fillData"), callback_data: 'homeScene.fillDataAction'}],
				],
			},
			parse_mode: 'HTML'
		})
		throw e
	}
  }
}
