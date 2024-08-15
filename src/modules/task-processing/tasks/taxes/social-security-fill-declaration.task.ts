import { Injectable } from '@nestjs/common';
import {
  Task,
  TaskProcessingPayload,
} from '../../../task-processing-queue/task-processing.types';

import { WebDriver } from 'selenium-webdriver';
import { ConfigService } from 'src/modules/config/config.service';
import { UserService } from 'src/modules/user/user.service';
import { SeleniumService } from 'src/modules/selenium/selenium.service';
import {
  socialSecurityLogin,
  socialSecuriyGoMainPage,
} from '../../selenium-scenarios/seg-social/social-security.scenarios';
import { I18nService } from 'nestjs-i18n';
import {
  checkIfDeclarationIsFilled,
  SocialSecurityDeclarationData,
  socialSecurityFillTrimestralDeclaration,
} from '../../selenium-scenarios/seg-social/declaration/fill-trimestral-declaration';
import { getPreviousQuarter, getPreviousQuarterYear } from 'src/utils/date';
import { User } from 'src/entities/user.entity';
import { NotificaitonService } from 'src/modules/notification/notification.service';

@Injectable()
export class SocialSecurityFillDeclarationTask implements Task {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly seleniumService: SeleniumService,
    private readonly notificationService: NotificaitonService,
    private readonly i18n: I18nService,
  ) {}
  async run(task: TaskProcessingPayload): Promise<void> {
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
    task: TaskProcessingPayload,
  ): Promise<void> {
    const { niss, segSocialPassword } = metaFields;

    await socialSecuriyGoMainPage(driver);
    await socialSecurityLogin(driver, {
      niss: niss.fieldValue,
      password: segSocialPassword.fieldValue,
    });

    const data: SocialSecurityDeclarationData = {
      previousQuarter: getPreviousQuarter(),
      previousQuarterYear: getPreviousQuarterYear(),
    };

    if (await checkIfDeclarationIsFilled(driver, data)) {
      return;
    }

    await socialSecurityFillTrimestralDeclaration(driver, data);

    await this.notificationService.sendNotification(
      user,
      'Successfully submitted you declaration!',
    );
  }
}
