import { Action, Ctx, Hears, Scene, SceneEnter } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { UserService } from 'src/modules/user/user.service';
import { TelegramService } from 'src/modules/telegram-config/telegram.service';
import { FeatureService } from 'src/modules/feature/feature.service';
import { TaskService } from 'src/modules/task/task.service';
import { TaskProcessingQueueService } from 'src/modules/task-processing-queue/task-processing-queue.service';
import { Markup } from 'telegraf';
import { SubscriptionService } from 'src/modules/subscription/subscription.service';
import { DateTime } from 'luxon';
import { PayementsView } from '../../components/payments';
import { UserRequestDataService } from 'src/modules/user-request-data/user-request-data.service';

@Injectable()
@Scene('homeScene')
export class HomeScene {
  constructor(
    private readonly i18n: I18nService,
    private readonly userService: UserService,
    private readonly telegramService: TelegramService,
    private readonly featureService: FeatureService,
    private readonly tasksService: TaskService,
    private readonly taskProcessingQueueService: TaskProcessingQueueService,
    private readonly subscriptionService: SubscriptionService,
    private readonly userRequestDataService: UserRequestDataService,
  ) {}
  @SceneEnter()
  async enter(@Ctx() ctx: SceneContext) {}

  @Hears('📦 Subscriptions')
  async onServicesAction(@Ctx() ctx: SceneContext) {
    const existingSubscription =
      await this.subscriptionService.findActiveUserSubscriptionByTelegramId(
        String(ctx.from.id),
      );

    if (!existingSubscription) {
      const subscriptions =
        await this.subscriptionService.getSubscriptionPackagesGroupedByName();
      const subscriptionsInlineKeyboard = subscriptions.map((subscription) => {
        return [
          {
            text: `${subscription.name}`,
            callback_data: `expandSubscription.${subscription.name}Action`,
          },
        ];
      });

      await ctx.reply('Choose your subscription', {
        reply_markup: {
          inline_keyboard: subscriptionsInlineKeyboard,
        },
        parse_mode: 'HTML',
      });
      return;
    } else {
      let text = `Your subscription: ${existingSubscription.subscription.name}\n\n`;
      const startDateStr = DateTime.fromJSDate(
        existingSubscription.startDate,
      ).toFormat('dd.MM.yyyy');
      text += `Start date: ${startDateStr}\n`;
      if (existingSubscription?.endDate) {
        const endDateStr = DateTime.fromJSDate(
          existingSubscription.endDate,
        ).toFormat('dd.MM.yyyy');
        text += `End date: ${endDateStr}\n`;
      } else {
        text += `End date: -\n`;
      }

      const SUBSCRIPTION_MENU = Markup.inlineKeyboard([
        Markup.button.callback('Cancel subscription', 'cancelSubscription'),
      ]);

      await ctx.reply(text, SUBSCRIPTION_MENU);
      return;
    }
  }

  @Action(/expandSubscription\.(.*)Action/)
  async onSubscriptionAction(@Ctx() ctx: SceneContext) {
    const subscriptionName = (ctx as any).match[1];
    const subscription =
      await this.subscriptionService.getSubscriptionPackagesByName(
        subscriptionName,
      );

    const subscriptionInlineKeyboard = subscription.map((subscription) => {
      const text = `Buy ${subscription.periodType} subscription for ${subscription.price} €`;
      return [
        Markup.button.callback(
          text,
          `buySubscription.${subscription.id}Action`,
        ),
      ];
    });

    const firstSubscription = subscription[0];
    let text = `📦<b>${firstSubscription.name}</b>\n\n`;
    text += `${firstSubscription.description}\n\n`;
    text += `Available Features:\n`;
    firstSubscription.subscriptionPackageFeatures.forEach((feature) => {
      text += ` - ${feature.feature.name}\n`;
    });

    await ctx.reply(text, {
      reply_markup: {
        inline_keyboard: subscriptionInlineKeyboard,
      },
      parse_mode: 'HTML',
    });
  }

  @Action(/buySubscription\.(.*)Action/)
  async onBuySubscriptionAction(@Ctx() ctx: SceneContext) {
    const subscriptionId = (ctx as any).match[1];
    const user = await this.userService.getUserByTelegramId(
      String(ctx.from.id),
    );

    const existingSubscription =
      await this.subscriptionService.findActiveUserSubscriptionByTelegramId(
        String(ctx.from.id),
      );
    if (existingSubscription) {
      // await ctx.reply("You already have an active subscription");
      return;
    }

    await this.subscriptionService.createUserSubscription(
      user.id,
      Number(subscriptionId),
    );
  }

  @Action('cancelSubscription')
  async onCancelSubscription(@Ctx() ctx: SceneContext) {
    const user = await this.userService.getUserByTelegramId(
      String(ctx.from.id),
    );
    await this.subscriptionService.cancelSubscription(user.id);
  }

  @Hears('🎬 Actions')
  async onServicesActions(@Ctx() context: SceneContext) {
    const tasks = await this.tasksService.getTasks();

    const tasksInlineKeyboard = tasks.map((task) => {
      return [
        { text: task.name, callback_data: `task.${task.systemName}Action` },
      ];
    });

    await context.reply(this.i18n.t('t.home.features'), {
      reply_markup: {
        inline_keyboard: tasksInlineKeyboard,
      },
      parse_mode: 'HTML',
    });
  }

  @Action(/task\.(.*)Action/)
  async onTaskAction(@Ctx() context: SceneContext) {
    const taskType = (context as any).match[1];
    await this.taskProcessingQueueService.addJobByTelegramId<null>(
      context.from.id,
      {
        type: taskType,
        data: null,
      },
    );
  }

  @Action('viewPaymentsAction')
  @Hears('💳 Tax payments')
  async onTaxAction(@Ctx() context: SceneContext) {
    const user = await this.userService.getUserByTelegramId(
      String(context.from.id),
    );

    const payments =
      await this.userRequestDataService.getUserAnswersByFieldSystemName(
        user.id,
        'taxPayements',
      );

    const propsPayments = payments.map((payment) => {
      return {
        description: payment.description,
        amount: payment.amount,
        dueDate: payment.dueDate
          ? DateTime.fromMillis(payment.dueDate).toFormat('yyyy-MM-dd')
          : null,
        link: payment.link,
      };
    });

    await PayementsView.renderReply(context, { payments: propsPayments });
  }

  @Hears('📊 Fill in the data')
  async onFillDataAction(@Ctx() context: SceneContext) {
    context.scene.enter('formScene');
  }

  @Action('taxAction')
  async onAnswerTax(@Ctx() context: SceneContext) {
    context.scene.enter('taxScene');
  }

  @Action('pricesAction')
  async onAnswerPrices(@Ctx() context: SceneContext) {
    context.scene.enter('pricesScene');
  }

  @Action('fillDataAction')
  async onAnswerfillData(@Ctx() context: SceneContext) {
    context.scene.enter('formScene');
  }

  // parse the action and data from the notification body
  // runTaskAction.${notificationBody?.data.type}.data.${notificationBody?.data.data}
  @Action(/runTaskAction\.(.*)/)
  async onRunTaskAction(@Ctx() context: SceneContext) {
    // remove markup from initial message via editing
    await context.editMessageReplyMarkup(null);

    const data = (context as any).match[1].split('.data.');
    const taskType = data[0];
    const taskData = JSON.parse(data[1]);

    await this.taskProcessingQueueService.addJobByTelegramId<null>(
      context.from.id,
      {
        type: taskType,
        data: taskData,
      },
    );
  }
}
