import { Action, Ctx, Hears, Scene, SceneEnter } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { Update } from 'telegraf/typings/core/types/typegram';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ActionContract } from 'src/decorators/action.decorator';
import { UserService } from 'src/modules/user/user.service';
import { QUESTIONS_AND_FIELDS, Question, QuestionType } from './questions';
import { FormError } from './form.errors';
import { TaskProcessingQueueService } from 'src/modules/task-processing/services/task-processing.queue';
import { TaskProcessingJobName } from 'src/modules/task-processing/task-processing.types';
import { QuestionService } from 'src/modules/question/question.service';
import { FindQuestionResult } from 'src/repositories/queries/getPriorityQuestionQuery';

export interface SceneState {
	currentFieldId: number;
}

@Injectable()
@Scene('formScene')
export class FormScene {
	constructor(
		private readonly i18n: I18nService,
		private readonly userService: UserService,
		private readonly taskProcessingQueueService: TaskProcessingQueueService,
		private readonly questionsService: QuestionService,
	) { }
	@SceneEnter()
	async enter(@Ctx() ctx: SceneContext) {
		ctx.reply(this.i18n.t("t.poll.welcome"), {
			reply_markup: {
				inline_keyboard: [
					[{ text: "Start poll", callback_data: 'formScene.startPoll' }],
				],
			},
			parse_mode: 'HTML'
		});
	}

	@Action('formScene.startPoll')
	async onAnswerTax(
		@Ctx() ctx: SceneContext
	) {
		const question = await this.getNextQuestion(ctx.from.id)
		await this.sendQuestion(ctx, question)
	}

	@Action(/formSceneQuestion:(.*)/)
	@Hears(/(.*)/)
	async hears(@Ctx() ctx: SceneContext) {
		if (!(ctx.scene.state as SceneState)?.currentFieldId) {
			ctx.scene.enter('homeScene');
			return
		}

		const user = await this.userService.getUserByTelegramId(String(ctx.from.id))
		const askedQuestion = await this.questionsService.getQuestionByUserIdAndFieldId(user.id, (ctx.scene.state as SceneState).currentFieldId)

		try {
			const answer = this.extractAnswer(askedQuestion, ctx)

			await this.saveAnswer(user.id, askedQuestion.fieldId, answer)

			const nextQuestion = await this.getNextQuestion(ctx.from.id)
			if (!nextQuestion) {
				await this.endPoll(ctx);
				return
			}

			await this.sendQuestion(ctx, nextQuestion);
		} catch (e) {
			if (e instanceof FormError) {
				await ctx.reply(e.message)
			}
		}
	}

	private async getNextQuestion(telegramId: number) {
		const user = await this.userService.getUserByTelegramId(String(telegramId))
		const question = await this.questionsService.getPriorityQuestion(user.id)

		return question;
	}

	private async endPoll(ctx: SceneContext) {
		delete (ctx.scene.state as SceneState).currentFieldId;
		await this.taskProcessingQueueService.addJob<null>(ctx.from.id, {
			type: TaskProcessingJobName.CHECK_CRENDENTIALS,
			data: null
		})
		ctx.scene.enter('homeScene');
	}

	private async saveAnswer(userId: number, fieldId: number, answer: string) {
		await this.questionsService.saveAnswer(userId, fieldId, answer)
	}

	private async sendQuestion(ctx: SceneContext, question: FindQuestionResult) {
		if (!question) {
			// TODO handle end of questions
			return
		}
		const questionText = this.prepareQuestionText(question)
		switch (question.type) {
			case QuestionType.TEXT:
				await ctx.reply(questionText, { parse_mode: 'HTML' });
				break;
			case QuestionType.OPTIONS:
				const options = question.options.map(option => ([{ text: option.text, callback_data: `formSceneQuestion:${option.value}` }]))
				await ctx.reply(questionText, {
					reply_markup: {
						inline_keyboard: options,
					},
					parse_mode: 'HTML'
				});
				break;
			default:
				await ctx.reply(questionText, { parse_mode: 'HTML' });
				break;
		}
		ctx.scene.state = {
			currentFieldId: question.fieldId
		}
	}

	private prepareQuestionText(question: FindQuestionResult) {
		return `${question.question}${question?.description ? "\n" + question?.description : ""}`
	}

	private extractAnswer(askedQuestion: FindQuestionResult, ctx: SceneContext) {
		switch (askedQuestion.type) {
			case QuestionType.TEXT:
				const text = (ctx.message as any).text
				if (!text) {
					throw new FormError("Please send a text message")
				}
				return text
			case QuestionType.OPTIONS:
				if (!ctx.callbackQuery) {
					throw new FormError("Please choose one of the options")
				}
				const value = (ctx.callbackQuery as any).data.split(":")[1]
				const option = askedQuestion.options.find(option => option.value === value)?.value
				if (!option) {
					throw new FormError("Please choose one of the options")
				}
				return value
			default:
				const textVal = (ctx.message as any).text
				if (!textVal) {
					throw new FormError("Please send a text message")
				}
				return textVal
		}
	}
}