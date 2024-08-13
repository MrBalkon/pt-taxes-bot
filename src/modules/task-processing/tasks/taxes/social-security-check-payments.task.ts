
import { Injectable } from "@nestjs/common";
import { Task, TaskProcessingPayload } from "../../../task-processing-queue/task-processing.types";

import { WebDriver } from 'selenium-webdriver';
import { SeleniumService } from "src/modules/selenium/selenium.service";
import { socialSecurityLogin, socialSecuriyGoMainPage } from "../../selenium-scenarios/seg-social/social-security.scenarios";
import { NotificaitonService } from "src/modules/notification/notification.service";
import { NotificationAction } from "src/modules/notification/notification.types";
import { PAYMENT_LINK, goPayementsPage, retrievePayments } from "../../selenium-scenarios/seg-social/payment/retrieve-payments.scenario";
import { UserAnswerService } from "src/modules/user-answer/user-answer.service";
import { FieldValueType } from "src/entities/user-answer.entity";

@Injectable()
export class SocialSecurityCheckPayments implements Task {
	constructor(
		private readonly seleniumService: SeleniumService,
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
