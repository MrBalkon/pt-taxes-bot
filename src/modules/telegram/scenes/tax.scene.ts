import {Action, Ctx, Hears, Scene, SceneEnter} from 'nestjs-telegraf';
import {SceneContext} from 'telegraf/typings/scenes';
import {Update} from 'telegraf/typings/core/types/typegram';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ActionContract } from 'src/decorators/action.decorator';
import { TaskProcessingQueueService } from 'src/modules/task-processing-queue/task-processing-queue.service';
import { TaskProcessingJobName } from 'src/modules/task-processing-queue/task-processing.types';

@Injectable()
@Scene('taxScene')
export class TaxScene {
	constructor(
		private readonly i18n: I18nService,
		private readonly taskProcessingQueueService: TaskProcessingQueueService,
	) {}
   @SceneEnter()
   async enter(@Ctx() ctx: SceneContext) {
		ctx.reply(this.i18n.t("t.tax.welcome"), {
           reply_markup: {
			   inline_keyboard: [
				[{text: this.i18n.t("t.tax.socialSecurity"), callback_data: 'taxScene.socialSecurityAction'}],
				[{text: this.i18n.t("t.tax.iva"), callback_data: 'taxScene.ivaAction'}],
				[{text: this.i18n.t("t.tax.irs"), callback_data: 'taxScene.irsAction'}],
				[{text: this.i18n.t("t.tax.financaisFillData"), callback_data: 'taxScene.financaisFillData'}],
			   ]
           },
		   parse_mode: 'HTML'
       });
	//    ctx.scene.enter('formScene')
   }

   @Action('taxScene.financaisFillData')
   async onAnswerfinancaisFillDatay(
	 @Ctx() ctx: SceneContext
   ) {
	   await this.taskProcessingQueueService.addJobByTelegramId<null>(ctx.from.id, {
		   type: TaskProcessingJobName.FINANCAIS_FILL_DATA,
		   data: null
	   });
   }

   @Action('taxScene.socialSecurityAction')
   async onAnswerSocialSecurity(
	 @Ctx() ctx: SceneContext
   ) {
	   await this.taskProcessingQueueService.addJobByTelegramId<null>(ctx.from.id, {
		   type: TaskProcessingJobName.SOCIAL_SECURITY_FILL_DECLARATION,
		   data: null
	   });
	//    await this.taskProcessingQueueService.addJobByTelegramId<null>(ctx.from.id, {
	// 	   type: TaskProcessingJobName.GOOGLE_EXAMPLE_COM,
	// 	   data: null
	//    });
	//    await this.taskProcessingQueueService.addJobByTelegramId<{ text: string }>(ctx.from.id, {
	// 	   type: TaskProcessingJobName.TELEGRAM_NOTIFY,
	// 	   data: {
	// 		text: "notification!!!!"
	// 	   }
	//    });
   }
}