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
import { Context, Markup, Telegraf } from 'telegraf';
  import { SceneContext } from 'telegraf/typings/scenes'
import { UserService } from '../user/user.service';
import { FeatureService } from '../feature/feature.service';
import { TelegramService } from '../telegram-config/telegram.service';
import { HomeScene } from './scenes/home/home.scene';

  @Update()
  export class TelegramUpdate {
	constructor(
        @InjectBot() private readonly bot: Telegraf<Context>,
		private readonly i18n: I18nService,
		private readonly userService: UserService,
		private readonly telegramService: TelegramService,
		private readonly homeScene: HomeScene
      ) {}

	@Start()
	async start(@Ctx() ctx: SceneContext) {
	  const existingUser = await this.userService.getAcessedUserByTelegramId(String(ctx.from.id));
	  if (!existingUser) {
		await ctx.reply(this.i18n.t("t.access.restricted"));
		return
	  }

	  const MAIN_MENU = Markup.keyboard([
		["📦 Subscriptions"],
		["💳 Tax payments"],
		["📊 Fill in the data"],
		["🎬 Actions"]
		]).resize();

	  await ctx.reply(this.i18n.t("t.home.welcome"), MAIN_MENU)

	  await ctx.scene.enter('homeScene');
	}

	@Command('test')
	async unlink(@Ctx() ctx: SceneContext) {
		console.log(ctx.scene)
	  await ctx.scene.enter('basicScene');
	  return
	}

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
  }