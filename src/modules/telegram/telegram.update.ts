import { I18nService } from 'nestjs-i18n';
import {
	Update,
	Ctx,
	Start,
	Help,
	On,
	Hears,
	Command,
	InjectBot,
  } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';
  import { SceneContext } from 'telegraf/typings/scenes'
import { UserService } from '../user/user.service';

  @Update()
  export class TelegramUpdate {
	constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
		private readonly i18n: I18nService,
		private readonly userService: UserService
      ) {}

	@Start()
	async start(@Ctx() ctx: SceneContext) {
	  const existingUser = await this.userService.getAcessedUserByTelegramId(String(ctx.from.id));
	  if (!existingUser) {
		await ctx.reply(this.i18n.t("t.access.restricted"));
		return
	  }
	  await ctx.scene.enter('homeScene');
	}

	@Command('test')
	async unlink(@Ctx() ctx: SceneContext) {
		console.log(ctx.scene)
	  await ctx.scene.enter('basicScene');
	  return
	}

	// @Help()
	// async help(@Ctx() ctx: TelegrafContext) {
	//   await ctx.reply('Send me a sticker');
	// }
  
	// @On('sticker')
	// async on(@Ctx() ctx: SceneContext) {
	//   await ctx.reply('👍');
	// }
  
	// @Hears(/(.*)/)
	// async hears(@Ctx() ctx: SceneContext) {
	//   const text = (ctx.message as any).text;
	//   console.log(text)
	//   const actionName = this.i18n.getTranslations()
	//   console.log(actionName)
	//   ctx.scene.current.action(text, () => {});
	//   await ctx.reply('Hey there');
	// }

	@Hears("📝 Taxes")
	async onAnswerTax(
	  @Ctx() context: SceneContext
	) {
		context.reply(this.i18n.t("t.tax.main"));
		context.scene.enter('taxScene');
	}

	@Hears("💸 Prices")
	async onAnswerPrices(
	  @Ctx() context: SceneContext
	) {
		 context.reply(this.i18n.t("t.prices.main"));
	}

	// @Hears("💸 Prices")
	// async onAnswerPrices(
	//   @Ctx() context: SceneContext
	// ) {
	// 	 context.reply(this.i18n.t("t.prices.main"));
	// }
  }