
import { Injectable } from "@nestjs/common";
import { Task, TaskProcessingPayload } from "../../../task-processing-queue/task-processing.types";

import { WebDriver } from 'selenium-webdriver';
import { ConfigService } from "src/modules/config/config.service";
import { UserService } from "src/modules/user/user.service";
import { SeleniumService } from "src/modules/selenium/selenium.service";
import { TelegramService } from "src/modules/telegram-config/telegram.service";
import { socialSecurityLogin, socialSecuriyGoMainPage } from "../../selenium-scenarios/seg-social/social-security.scenarios";
import { I18nService } from "nestjs-i18n";
import { SocialSecurityDeclarationData, socialSecurityFillTrimestralDeclaration } from "../../selenium-scenarios/seg-social/declaration/fill-trimestral-declaration";
import { getPreviousQuarter, getPreviousQuarterYear } from "src/utils/date";
import { UserWithMetaFields } from "src/modules/user/user.types";
import { NotificaitonService } from "src/modules/notification/notification.service";
import { NotificationAction } from "src/modules/notification/notification.types";
import { PaymentService } from "src/modules/payment/payment.service";
import { PAYMENT_LINK, goPayementsPage, retrievePayments } from "../../selenium-scenarios/seg-social/payment/retrieve-payments.scenario";
import { Payment } from "src/entities/payment.entity";
import { DeepPartial } from "typeorm";
import { UserAnswerService } from "src/modules/user-answer/user-answer.service";
import { FieldValueType, UserAnswer } from "src/entities/user-answer.entity";

@Injectable()
export class SocialSecurityCheckPayments implements Task {
	constructor(
		private readonly seleniumService: SeleniumService,
		private readonly paymentService: PaymentService,
		private readonly notificationService: NotificaitonService,
		private readonly answersService: UserAnswerService,
	) {}
  async run(task: TaskProcessingPayload): Promise<void> {
	await this.seleniumService.execute(async (driver) => this.runInSelenium(driver, task))
  }

  async runInSelenium(driver: WebDriver, task: TaskProcessingPayload): Promise<void> {
	const { niss, segSocialPassword } = task.metaFields

	await socialSecuriyGoMainPage(driver)
	await socialSecurityLogin(driver, { niss: niss.fieldValue, password: segSocialPassword.fieldValue })

	await goPayementsPage(driver)
	const segSocialPayments = await retrievePayments(driver)

	const dbPayments: FieldValueType[] = segSocialPayments.map((payment) => {
		return {
			description: `(Segurança Social) ${payment.type}`,
			amount: payment.valueAmount,
			dueDate: payment.expirationDate.toMillis(),
			userId: task.user.id,
			taskId: task.systemTaskId,
			link: PAYMENT_LINK
		}
	})

	const {
		answersToDelete,
		answersToCreate,
	} = await this.answersService.answersSyncByFieldSystemName(task.user.id, 'taxPayements', dbPayments)

	if (answersToCreate.length) {
		await this.notificationService.sendNotification(task.user, `You've got new payments from Segurança Social! ${answersToCreate.length}`, {
			action: NotificationAction.VIEW_PAYMENTS,
		})
	}
  }
}
