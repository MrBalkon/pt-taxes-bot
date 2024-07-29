import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Context } from 'telegraf';
import { ExtraReplyMessage } from 'telegraf/typings/telegram-types';

@Injectable()
export class TelegramService {
	constructor(
		@InjectBot() private readonly bot: Telegraf<Context>,
	) {}

	async sendMessage(chatId: string, message: string, extra?: ExtraReplyMessage) {
		await this.bot.telegram.sendMessage(chatId, message, extra);
	}
}