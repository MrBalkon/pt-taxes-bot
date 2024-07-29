import {Action, Ctx, Hears, Scene, SceneEnter} from 'nestjs-telegraf';
import {SceneContext} from 'telegraf/typings/scenes';
import {Update} from 'telegraf/typings/core/types/typegram';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ActionContract } from 'src/decorators/action.decorator';
import { UserService } from 'src/modules/user/user.service';
import { QuestionService } from 'src/modules/question/question.service';

@Injectable()
@Scene('homeScene')
export class HomeScene {
	constructor(
		private readonly i18n: I18nService,
		private readonly userService: UserService,
		private readonly questionsService: QuestionService,
	) {}
   @SceneEnter()
   async enter(@Ctx() ctx: SceneContext) {
		const user = await this.userService.getUserByTelegramId(String(ctx.from.id));
	    const questionsCount = await this.questionsService.getQuestionsCount(user.id);
		ctx.reply(this.i18n.t("t.home.welcome"), {
           reply_markup: {
               inline_keyboard: [
                   [{text: this.i18n.t("t.home.tax"), callback_data: 'taxAction'}],
                   [{text: this.i18n.t("t.home.prices"), callback_data: 'pricesAction'}],
                   [{text: `${this.i18n.t("t.home.fillData")} (${questionsCount})`, callback_data: 'fillDataAction'}],
               ],
           },
		   parse_mode: 'HTML'
       });
   }

   @Action('taxAction')
   async onAnswerTax(
	 @Ctx() context: SceneContext
   ) {
	   context.scene.enter('taxScene');
   }

   @Action('pricesAction')
   async onAnswerPrices(
	 @Ctx() context: SceneContext
   ) {
	   context.scene.enter('pricesScene');
   }

   @Action('fillDataAction')
   async onAnswerfillData(
	 @Ctx() context: SceneContext
   ) {
	   context.scene.enter('formScene');
   }
}