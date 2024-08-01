import { Action, Ctx, Hears, Scene, SceneEnter } from 'nestjs-telegraf';
import { SceneContext } from 'telegraf/typings/scenes';
import { Update } from 'telegraf/typings/core/types/typegram';
import { Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { ActionContract } from 'src/decorators/action.decorator';
import { UserService } from 'src/modules/user/user.service';
import { FormError } from './form.errors';
import { TaskProcessingQueueService } from 'src/modules/task-processing/services/task-processing.queue';
import { TaskProcessingJobName } from 'src/modules/task-processing/task-processing.types';
import { QuestionService } from 'src/modules/question/question.service';
import { FormQuestion } from './form.types';
import { QuestionPeriodTime, QuestionType } from 'src/entities/question.entity';
import { getMonthNameByNumber, getPreviousQuarterMonths, getPreviousQuarterMonthsNames, getPreviousQuarterYear } from 'src/utils/date';

export interface SceneState {
	currentFieldId?: number;
	currentChildrenIndex?: number;
	childrenAnswerArray?: string[];
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
		if (!this.getCtxState(ctx)?.currentFieldId) {
			ctx.scene.enter('homeScene');
			return
		}

		const user = await this.userService.getUserByTelegramId(String(ctx.from.id))
		const askedQuestion = await this.questionsService.getQuestionByUserIdAndFieldId(user.id, (ctx.scene.state as SceneState).currentFieldId)
		this.expandQuestion(askedQuestion)

		try {
			const answer = this.extractAnswer(askedQuestion, ctx)

			await this.saveAnswer(ctx, user.id, askedQuestion, answer)

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

	private async saveAnswer(ctx: SceneContext, userId: number, question: FormQuestion, answer: string) {
		if (question.children) {
			const childrenAnswerArray = this.getCtxStateValue(ctx, 'childrenAnswerArray') || []
			childrenAnswerArray.push(answer)
			this.updateCtxState(ctx, 'childrenAnswerArray', childrenAnswerArray)
			if (this.getCtxStateValue(ctx, 'currentChildrenIndex') < question.children.length - 1) {
				return
			}
			// handle end of children questions
			answer = childrenAnswerArray
			this.deleteCtxState(ctx, 'childrenAnswerArray')
		}
		return this.questionsService.saveAnswer(userId, question, answer)
	}

	private async getNextQuestion(telegramId: number) {
		const user = await this.userService.getUserByTelegramId(String(telegramId))
		const question = (await this.questionsService.getPriorityQuestion(user.id) as FormQuestion)

		this.expandQuestion(question)

		return question;
	}

	private async endPoll(ctx: SceneContext) {
		delete (ctx.scene.state as SceneState).currentFieldId;
		await this.taskProcessingQueueService.addJobByTelegramId<null>(ctx.from.id, {
			type: TaskProcessingJobName.CHECK_CRENDENTIALS,
			data: null
		})
		ctx.scene.enter('homeScene');
	}

	private async sendQuestion(ctx: SceneContext, question: FormQuestion) {
		if (!question) {
			// TODO handle end of questions
			return
		}

		// ctx.state

		this.updateCtxState(ctx, 'currentFieldId', question.fieldId)

		if (question.children) {
			if (this.getCtxState(ctx).currentChildrenIndex === undefined) {
				this.updateCtxState(ctx, 'currentChildrenIndex', 0)
				return this.sendQuestion(ctx, question.children[0])
			}
			const nextChildIndex = this.getCtxStateValue(ctx, 'currentChildrenIndex') + 1
			if (nextChildIndex < question.children.length) {
				this.updateCtxState(ctx, 'currentChildrenIndex', nextChildIndex)
				return this.sendQuestion(ctx, question.children[nextChildIndex])
			}
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
	}

	private expandQuestion(question: FormQuestion) {
		if (question?.periodTime == QuestionPeriodTime.PREVIOUS_QUARTER_MONTHS) {
			const previousQuarterMonths = getPreviousQuarterMonthsNames()
			const questions = previousQuarterMonths.map(month => {
				return {
					...question,
					question: question.question + ` (${month})`,
				}
			})
			question.children = questions
		}

	}

	private prepareQuestionText(question: FormQuestion) {
		return `${question.question}${question?.description ? "\n" + question?.description : ""}`
	}

	private extractAnswer(askedQuestion: FormQuestion, ctx: SceneContext) {
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
			case QuestionType.FLOAT:
				const numberValue = Number((ctx.message as any).text)
				if (isNaN(numberValue)) {
					throw new FormError("Please send a number")
				}
				return numberValue
			default:
				const textVal = (ctx.message as any).text
				if (!textVal) {
					throw new FormError("Please send a text message")
				}
				return textVal
		}
	}

	private updateCtxState(ctx: SceneContext, key: string, value: any) {
		(ctx.scene.state as SceneState) = {
			...ctx.scene.state,
			[key]: value
		}
	}

	private getCtxState(ctx: SceneContext) {
		return ctx.scene.state as SceneState
	}

	private getCtxStateValue(ctx: SceneContext, key: string) {
		return (ctx.scene.state as SceneState)[key]
	}

	private deleteCtxState(ctx: SceneContext, key: string) {
		delete (ctx.scene.state as SceneState)[key]
	}
}