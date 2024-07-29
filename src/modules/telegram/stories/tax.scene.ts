import {Action, Ctx, Hears, Scene, SceneEnter} from 'nestjs-telegraf';
import {SceneContext} from 'telegraf/typings/scenes';
import {Update} from 'telegraf/typings/core/types/typegram';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ActionContract } from 'src/decorators/action.decorator';
import { TaskProcessingQueueService } from 'src/modules/task-processing/services/task-processing.queue';
import { TaskProcessingJobName } from 'src/modules/task-processing/task-processing.types';

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
			   ]
           },
		   parse_mode: 'HTML'
       });
	//    ctx.scene.enter('formScene')
   }

   @Action('taxScene.socialSecurityAction')
   async onAnswerSocialSecurity(
	 @Ctx() ctx: SceneContext
   ) {
	   await this.taskProcessingQueueService.addJob<null>(ctx.from.id, {
		   type: TaskProcessingJobName.SOCIAL_SECURITY_FILL_DECLARATION,
		   data: null
	   });
	//    await this.taskProcessingQueueService.addJob<null>(ctx.from.id, {
	// 	   type: TaskProcessingJobName.GOOGLE_EXAMPLE_COM,
	// 	   data: null
	//    });
	//    await this.taskProcessingQueueService.addJob<{ text: string }>(ctx.from.id, {
	// 	   type: TaskProcessingJobName.TELEGRAM_NOTIFY,
	// 	   data: {
	// 		text: "notification!!!!"
	// 	   }
	//    });
   }
}