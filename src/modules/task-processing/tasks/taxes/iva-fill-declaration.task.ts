import { Injectable } from '@nestjs/common';
import {
  Task,
  TaskProcessingPayloadTemplate,
} from '../../../task-processing-queue/task-processing.types';

import { WebDriver } from 'selenium-webdriver';
import { SeleniumService } from 'src/modules/selenium/selenium.service';
import { I18nService } from 'nestjs-i18n';
import { User } from 'src/entities/user.entity';
import {
  financaisGoMainPage,
  financaisLogin,
  gotToAtividadePage,
  retrieveAtividadePageData,
} from '../../selenium-scenarios/financais/financais.scenarios';
import { getPreviousQuarter, getPreviousQuarterYear } from 'src/utils/date';
import {
  prefillPeriodicIVA,
  findExistingDeclarations,
  goConsultarPeriodicIVA,
  goFillDeclarationPage,
  getIvaXml,
  validateIvaDeclaration,
} from '../../selenium-scenarios/financais/fill-periodc-iva';
import { NotificaitonService } from 'src/modules/notification/notification.service';
import { IvaRequestView } from 'src/modules/telegram/components/taxes/iva-request';
import { NotificationAction } from 'src/modules/notification/notification.types';
import { convertIvaStringToFloatString } from '../../selenium-scenarios/financais/utils/convertIvaStringToFloatString';
import {
  goPayementsPage,
  periodicIVARetrievePayements,
} from '../../selenium-scenarios/financais/payement/periodic-iva-retrieve-payments';
import { UserAnswerService } from 'src/modules/user-answer/user-answer.service';

export class FillIvaDeclarationTaskPayload {
  approveSubmit?: boolean;
}

@Injectable()
export class IVAFillDeclarationTask implements Task {
  constructor(
    private readonly seleniumService: SeleniumService,
    private readonly notificationService: NotificaitonService,
    private readonly userAnswerService: UserAnswerService,
  ) {}
  async run(
    task: TaskProcessingPayloadTemplate<FillIvaDeclarationTaskPayload>,
  ): Promise<void> {
    const user = task.user;
    const metaFields = task.metaFields;

    await this.seleniumService.execute(async (driver) =>
      this.runInSelenium(driver, user, metaFields, task),
    );
  }

  async runInSelenium(
    driver: WebDriver,
    user: User,
    metaFields: Record<string, any>,
    task: TaskProcessingPayloadTemplate<FillIvaDeclarationTaskPayload>,
  ): Promise<void> {
    const { nif, financasPassword } = metaFields;
    const quarterToFill = getPreviousQuarter();
    const quarterToFillYear = getPreviousQuarterYear();

    await financaisGoMainPage(driver);

    await financaisLogin(driver, {
      nif: nif.fieldValue,
      password: financasPassword.fieldValue,
    });

    await gotToAtividadePage(driver);

    const { category } = await retrieveAtividadePageData(driver);

    if (category !== 'B') {
      await this.notificationService.sendNotification(
        user,
        `🔔 We've tried to submit your Periodic IVA declaration for ${quarterToFill} quarter but it seems you're not in the correct category!`,
      );
      return;
    }

    await goConsultarPeriodicIVA(driver);

    const declarations = await findExistingDeclarations(driver);

    // TODO uncomment after tests
    // if (declarations.find(declaration => declaration.declarationQuarter === quarterToFill)) {
    // 	await this.notificationService.sendNotification(user, `🔔 We've tried to submit your Periodic IVA declaration for ${quarterToFill} quarter but it seems you've already submitted it!`)
    // 	return
    // }

    await goFillDeclarationPage(driver);

    await prefillPeriodicIVA(driver, { quarter: quarterToFill });

    const ivaData = await getIvaXml(driver);

    const validationResult = await validateIvaDeclaration(driver);

    // validationResult add not hasApprovedPeriodicIVASubmit
    if (validationResult && !task.data?.approveSubmit) {
      const { text } = IvaRequestView.getContent({
        quarter: String(quarterToFill),
        totalToPaySum: convertIvaStringToFloatString(
          String(ivaData.rosto.apuramento.ivaFavorEstadoTotal),
        ),
        totalToPayAfterDeductionsSum: convertIvaStringToFloatString(
          String(ivaData.rosto.apuramento.ivaAEntregar),
        ),
        deductionsSum: convertIvaStringToFloatString(
          String(ivaData.rosto.apuramento.ivaDedutivelTotal),
        ),
      });
      await this.notificationService.sendNotification(user, text, {
        action: NotificationAction.CALL_TASK,
        data: {
          type: IVAFillDeclarationTask.name,
          data: {
            approveSubmit: true,
          },
        },
      });
      return;
    }

    // TODO submit declaration

    await this.notificationService.sendNotification(
      user,
      'Successfully submitted you declaration!',
    );

    await goPayementsPage(driver);
    const payments = await periodicIVARetrievePayements(driver, {
      quarter: quarterToFill,
      year: quarterToFillYear,
    });

    const dbPayments = payments.map((payment) => {
      return {
        description: `(Periodic IVA) ${payment.period} Quarter`,
        amount: payment.valueAmount,
        dueDate: null,
        link: payment.paymentLink,
        type: 'periodicIvaPayment',
      };
    });

    const { answersToDelete, answersToCreate } =
      await this.userAnswerService.answersSyncByFieldSystemName(
        user.id,
        'taxPayements',
        dbPayments,
        (item) => item.type === 'periodicIvaPayment',
      );

    if (answersToCreate.length) {
      await this.notificationService.sendNotification(
        task.user,
        `You've got new payments for Periodic IVA! (${answersToCreate.length})`,
        {
          action: NotificationAction.VIEW_PAYMENTS,
        },
      );
    }
  }
}
