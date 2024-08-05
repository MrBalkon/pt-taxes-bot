import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Context } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { QuestionService } from '../question/question.service';
import { I18nService } from 'nestjs-i18n';
import { NotificaitonService } from '../notification/notification.service';
import { User } from 'src/entities/user.entity';
import { NotificationAction, NotificationExtra, NotificationServiceType } from '../notification/notification.types';

@Injectable()
export class TelegramService implements NotificationServiceType {
	constructor(
		@InjectBot() private readonly bot: Telegraf<Context>,
		private i18n: I18nService,
		private readonly questionService: QuestionService,
	) {}

	async sendNotification(user: User, message: string, notificationBody?: NotificationExtra): Promise<void> {
		const extra = this.getExtra(user, notificationBody);
		// if (notificationBody.action === NotificationAction.REQUEST_DATA) {
		// 	await this.bot.telegram.sendChatAction(user.telegramId, 'typing');
		// }
		await this.bot.telegram.sendMessage(user.telegramId, message, extra);
	}

	async sendMessage(chatId: string, message: string, extra?: ExtraReplyMessage) {
		await this.bot.telegram.sendMessage(chatId, message, extra);
	}

	public fillDataAction() {
		return {text: `${this.i18n.t("t.home.fillData")}`, callback_data: 'fillDataAction'};
	}

	public fillDataActionKeyboard() {
		return {text: `📊 Fill in the data`, callback_data: 'fillDataAction'};
	}

	private getExtra(user: User, notificationBody?: NotificationExtra): ExtraReplyMessage | undefined {
		switch (notificationBody?.action) {
			case NotificationAction.REQUEST_CREDENTIALS:
			case NotificationAction.REQUEST_DATA:
				return {
					reply_markup: {
						inline_keyboard: [
							[this.fillDataAction()],
						],
					},
					parse_mode: 'HTML'
				}
			default:
				return null
		}
	}
}