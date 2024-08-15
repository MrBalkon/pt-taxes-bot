import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Context } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { QuestionService } from '../question/question.service';
import { I18nService } from 'nestjs-i18n';
import { User } from 'src/entities/user.entity';
import {
  NotificationAction,
  NotificationExtra,
  NotificationServiceType,
} from '../notification/notification.types';

@Injectable()
export class TelegramService implements NotificationServiceType {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private i18n: I18nService,
    private readonly questionService: QuestionService,
  ) {}

  async sendNotification(
    user: User,
    message: string,
    notificationBody?: NotificationExtra,
  ): Promise<void> {
    const extra = this.getExtra(user, notificationBody);
    // if (notificationBody.action === NotificationAction.REQUEST_FIELD) {
    //   const fields = (notificationBody.data as any).fields;
    //   const action = `requestFieldsAction${fields.join(',')}`;
    //   await this.bot.telegram.sendChatAction(user.telegramId, 'typing');
    //   return;
    // }
    await this.bot.telegram.sendMessage(user.telegramId, message, extra);
  }

  async sendMessage(
    chatId: string,
    message: string,
    extra?: ExtraReplyMessage,
  ) {
    await this.bot.telegram.sendMessage(chatId, message, extra);
  }

  public fillDataAction() {
    return {
      text: `${this.i18n.t('t.home.fillData')}`,
      callback_data: 'fillDataAction',
    };
  }

  public fillDataActionKeyboard() {
    return { text: `📊 Fill in the data`, callback_data: 'fillDataAction' };
  }

  private getExtra(
    user: User,
    notificationBody?: NotificationExtra,
  ): ExtraReplyMessage | undefined {
    switch (notificationBody?.action) {
      case NotificationAction.REQUEST_CREDENTIALS:
      case NotificationAction.REQUEST_DATA:
        return {
          reply_markup: {
            inline_keyboard: [[this.fillDataAction()]],
          },
          parse_mode: 'HTML',
        };
      case NotificationAction.VIEW_PAYMENTS:
        return {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: this.i18n.t('t.home.viewPayments'),
                  callback_data: 'viewPaymentsAction',
                },
              ],
            ],
          },
          parse_mode: 'HTML',
        };
      case NotificationAction.REQUEST_OPTIONS_FIELD_SUBMITION:
        if (!notificationBody?.data) {
          throw new Error('No data provided for REQUEST_FIELDS action');
        }
        return {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Submit',
                  callback_data: `requestFieldsAction${notificationBody?.data.fields.join(',')}`,
                },
              ],
            ],
          },
          parse_mode: 'HTML',
        };
      case NotificationAction.CALL_TASK:
        if (!notificationBody?.data) {
          throw new Error('No data provided for CALL_TASK action');
        }

        return {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: 'Submit',
                  callback_data: `runTaskAction.${notificationBody?.data.type}.data.${JSON.stringify(notificationBody?.data.data)}`,
                },
              ],
            ],
          },
          parse_mode: 'HTML',
        };
      default:
        return {
          parse_mode: 'HTML',
        };
    }
  }
}
