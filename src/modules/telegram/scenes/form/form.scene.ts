import { Action, Ctx, Hears, Scene, SceneEnter } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { UserService } from 'src/modules/user/user.service';
import { FormError } from './form.errors';
import { TaskProcessingQueueService } from 'src/modules/task-processing-queue/task-processing-queue.service';
import { TaskProcessingJobName } from 'src/modules/task-processing-queue/task-processing.types';
import { QuestionService } from 'src/modules/question/question.service';
import { FormQuestion } from './form.types';
import { Question } from 'src/entities/question.entity';
import { UserRequestDataService } from 'src/modules/user-request-data/user-request-data.service';
import { FieldValueType } from 'src/entities/user-field.entity';

export interface SceneState {
  currentQuestionIndex?: number;
  questions: Question[];
}

@Injectable()
@Scene('formScene')
export class FormScene {
  constructor(
    private readonly i18n: I18nService,
    private readonly userService: UserService,
    private readonly taskProcessingQueueService: TaskProcessingQueueService,
    private readonly questionsService: QuestionService,
    private readonly userRequestDataService: UserRequestDataService,
  ) {}
  @SceneEnter()
  async enter(@Ctx() ctx: SceneContext) {
    ctx.reply(this.i18n.t('t.poll.welcome'), {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Start poll', callback_data: 'formScene.startPoll' }],
          [{ text: 'Cancel', callback_data: 'formScene.cancelPoll' }],
        ],
      },
      parse_mode: 'HTML',
    });
  }

  @Action('formScene.startPoll')
  async onAnswerTax(@Ctx() ctx: SceneContext) {
    const questions = await this.userRequestDataService.getUserMissingQuestions(
      ctx.from.id,
    );

    if (!questions.length) {
      await ctx.reply('You have already answered all the questions');
      ctx.scene.enter('homeScene');
      return;
    }
    this.updateCtxState(ctx, 'questions', questions);
    await this.sendQuestion(ctx, questions[0], 0);
  }

  @Action('formScene.cancelPoll')
  async onAnswerCancel(@Ctx() ctx: SceneContext) {
    this.cleanCtxState(ctx);
    ctx.scene.enter('homeScene');
  }

  @Action(/formSceneQuestion:(.*)/)
  @Hears(/(.*)/)
  async hears(@Ctx() ctx: SceneContext) {
    if (this.getCtxState(ctx)?.currentQuestionIndex === undefined) {
      // ctx.scene.enter('homeScene');
      return;
    }

    const user = await this.userService.getUserByTelegramId(
      String(ctx.from.id),
    );
    const askedQuestion =
      this.getCtxState(ctx).questions[
        this.getCtxStateValue(ctx, 'currentQuestionIndex')
      ];

    try {
      const answer = this.extractAnswer(askedQuestion, ctx);

      await this.saveAnswer(ctx, user.id, askedQuestion, answer);

      const nextQuestionIndex =
        this.getCtxStateValue(ctx, 'currentQuestionIndex') + 1;
      const nextQuestion = this.getCtxState(ctx).questions[nextQuestionIndex];
      if (!nextQuestion) {
        await this.endPoll(ctx);
        return;
      }

      await this.sendQuestion(ctx, nextQuestion, nextQuestionIndex);
    } catch (e) {
      if (e instanceof FormError) {
        await ctx.reply(e.message);
      }
    }
  }

  private async saveAnswer(
    ctx: SceneContext,
    userId: number,
    question: FormQuestion,
    answer: string,
  ) {
    if (question.children) {
      const childrenAnswerArray =
        this.getCtxStateValue(ctx, 'childrenAnswerArray') || [];
      childrenAnswerArray.push(answer);
      this.updateCtxState(ctx, 'childrenAnswerArray', childrenAnswerArray);
      if (
        this.getCtxStateValue(ctx, 'currentChildrenIndex') <
        question.children.length - 1
      ) {
        return;
      }
      // handle end of children questions
      answer = childrenAnswerArray;
      this.deleteCtxState(ctx, 'childrenAnswerArray');
    }
    return this.questionsService.saveAnswer(userId, question, answer);
  }

  private async endPoll(ctx: SceneContext) {
    this.cleanCtxState(ctx);
    await ctx.reply('You have successfully completed the poll');
    await this.taskProcessingQueueService.addJobByTelegramId<null>(
      ctx.from.id,
      {
        type: TaskProcessingJobName.TASK_MANAGER,
        data: null,
      },
    );
    ctx.scene.enter('homeScene');
  }

  private cleanCtxState(ctx: SceneContext) {
    delete (ctx.scene.state as SceneState).currentQuestionIndex;
    delete (ctx.scene.state as SceneState).questions;
  }

  private async sendQuestion(
    ctx: SceneContext,
    question: FormQuestion,
    questionIndex: number,
  ) {
    if (!question) {
      // TODO handle end of questions
      return;
    }

    this.updateCtxState(ctx, 'currentQuestionIndex', questionIndex);

    const questionText = this.prepareQuestionText(question);
    switch (question.field.valueType) {
      case FieldValueType.TEXT:
        await ctx.reply(questionText, { parse_mode: 'HTML' });
        break;
      case FieldValueType.OPTIONS:
        const options = question.field.options.map((option) => [
          {
            text: option.text,
            callback_data: `formSceneQuestion:${option.value}`,
          },
        ]);
        await ctx.reply(questionText, {
          reply_markup: {
            inline_keyboard: options,
          },
          parse_mode: 'HTML',
        });
        break;
      default:
        await ctx.reply(questionText, { parse_mode: 'HTML' });
        break;
    }
  }

  private prepareQuestionText(question: FormQuestion) {
    return `${question.question}${question?.description ? '\n' + question?.description : ''}`;
  }

  private extractAnswer(askedQuestion: FormQuestion, ctx: SceneContext) {
    switch (askedQuestion.field.valueType) {
      case FieldValueType.TEXT:
        const text = (ctx.message as any).text;
        if (!text) {
          throw new FormError('Please send a text message');
        }
        return text;
      case FieldValueType.OPTIONS:
        if (!ctx.callbackQuery) {
          throw new FormError('Please choose one of the options');
        }
        const value = (ctx.callbackQuery as any).data.split(':')[1];
        const option = askedQuestion.field.options.find(
          (option) => option.value === value,
        )?.value;
        if (!option) {
          throw new FormError('Please choose one of the options');
        }
        return value;
      case FieldValueType.FLOAT:
        const numberValue = Number((ctx.message as any).text);
        if (isNaN(numberValue)) {
          throw new FormError('Please send a number');
        }
        return numberValue;
      default:
        const textVal = (ctx.message as any).text;
        if (!textVal) {
          throw new FormError('Please send a text message');
        }
        return textVal;
    }
  }

  private updateCtxState(ctx: SceneContext, key: string, value: any) {
    (ctx.scene.state as any) = {
      ...ctx.scene.state,
      [key]: value,
    };
  }

  private getCtxState(ctx: SceneContext) {
    return ctx.scene.state as SceneState;
  }

  private getCtxStateValue(ctx: SceneContext, key: string) {
    return (ctx.scene.state as SceneState)[key];
  }

  private deleteCtxState(ctx: SceneContext, key: string) {
    delete (ctx.scene.state as SceneState)[key];
  }
}
