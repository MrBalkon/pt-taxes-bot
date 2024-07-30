import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Context } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';
import { QuestionService } from '../question/question.service';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class TelegramService {
	constructor(
		@InjectBot() private readonly bot: Telegraf<Context>,
		private i18n: I18nService,
		private readonly questionService: QuestionService,
	) {}

	async sendMessage(chatId: string, message: string, extra?: ExtraReplyMessage) {
		await this.bot.telegram.sendMessage(chatId, message, extra);
	}

	public async fillDataAction(userId: number) {
		const questionsCount = await this.questionService.getQuestionsCount(userId);
		return {text: `${this.i18n.t("t.home.fillData")} (${questionsCount})`, callback_data: 'fillDataAction'};
	}
}