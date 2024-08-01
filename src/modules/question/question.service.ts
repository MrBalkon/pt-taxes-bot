import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question, QuestionPeriodTime } from 'src/entities/question.entity';
import { UserAnswer } from 'src/entities/user-answer.entity';
import { FieldLifeSpanType } from 'src/entities/user-field.entity';
import { FindQuestionResult } from 'src/repositories/queries/getPriorityQuestionQuery';
import { QuestionRepository } from 'src/repositories/question.repository';
import { UserAnswerRepository } from 'src/repositories/user-answer.repository';
import { getPreviousQuarter, getPreviousQuarterMonths, getPreviousQuarterYear } from 'src/utils/date';
import { DeepPartial, Repository } from 'typeorm';

@Injectable()
export class QuestionService {
	constructor(
		private readonly questionRepository: QuestionRepository,
		private readonly answerRepository: UserAnswerRepository,
	) {}

	async getQuestions(userId: number) {
		return this.questionRepository.getQuestions(userId);
	}

	async getQuestionByUserIdAndFieldId(userId: number, fieldId: number) {
		return this.questionRepository.getQuestionByUserIdAndFieldId(userId, fieldId);
	}

	async getPriorityQuestion(userId: number) {
		return this.questionRepository.getPriorityQuestion(userId);
	}

	async getQuestionsCount(userId: number) {
		return this.questionRepository.getQuestionsCount(userId);
	}

	async saveAnswer(userId: number, question: FindQuestionResult, answer: string | string[]) {
		const answers = []

		if (!question.periodTime) {
			// check if answer is string
			if (typeof answer !== 'string') {
				throw new Error('Answer should be a string');
			}
			answers.push({
				userId,
				fieldId: question.fieldId,
				fieldValue: answer,
			});
		}

		if (question.periodTime === QuestionPeriodTime.PREVIOUS_QUARTER_MONTHS) {
			if (!Array.isArray(answer)) {
				throw new Error('Answer should be an array');
			}
			const previousQuarterMonths = getPreviousQuarterMonths()
			const previousQuarterYear = getPreviousQuarterYear()

			previousQuarterMonths.forEach((previousQuarterMonth, index) => {
				answers.push({
					userId,
					fieldId: question.fieldId,
					fieldValue: answer[index],
					month: previousQuarterMonth,
					year: previousQuarterYear,
				});
			})
		}

		if (question.periodTime === QuestionPeriodTime.PREVIOUS_QUARTER) {
			const previousQuarter = getPreviousQuarter()
			const previousQuarterYear = getPreviousQuarterYear()
			answers.push({
				userId,
				fieldId: question.fieldId,
				fieldValue: answer,
				month: previousQuarter,
				year: previousQuarterYear,
			});
		}

		return this.answerRepository.createAnswerBulk(answers);
	}

	async getUserMetaFieldsByTaskSystemName(userId: number, taskSystemName: string) {
		const answers = await this.answerRepository.getAnswersByUserIdAndTaskSystemName(userId, taskSystemName);

		return this.prepareAnswers(answers);
	}

	async getUserMetaFields(userId: number, fieldSystemNames: string[]) {
		const answers = await this.answerRepository.getAnswersByUserIdAndFieldSystemNames(userId, fieldSystemNames);

		return this.prepareAnswers(answers);
	}

	private prepareAnswers(answers: any[]) {
		return answers.reduce((acc, answer) => {
			if (answer.fieldLifeSpanType == FieldLifeSpanType.PERIODIC) {
				if (!acc[answer.fieldSystemName]) {
					acc[answer.fieldSystemName] = {};
				}

				if (!acc[answer.fieldSystemName][answer.year]) {
					acc[answer.fieldSystemName][answer.year] = [];
				}

				acc[answer.fieldSystemName][answer.year][answer.month] = answer;
				return acc;
			}
			acc[answer.fieldSystemName] = answer;
			return acc;
		}, {});
	}

	async setAnswerError(userId: number, fieldsSystemName: number, error: string) {
		return this.answerRepository.setAnswerError(userId, fieldsSystemName, error);
	}

	async deleteAnswer(userId: number, fieldsSystemName: string) {
		return this.answerRepository.deleteAnswer(userId, fieldsSystemName);
	}

	async deleteAnswerBulk(userId: number, fieldsSystemNames: string[]) {
		return this.answerRepository.deleteAnswerBulk(userId, fieldsSystemNames);
	}

	async saveAnswerByFieldSystemName(userId: number, fieldSystemName: string, data: DeepPartial<UserAnswer>) {
		return this.answerRepository.createOrUpdateAnswerByFieldSystemName(userId, fieldSystemName, data);
	}

	async createOrUpdateAnswerByFieldId(userId: number, fieldId: number, data: DeepPartial<UserAnswer>) {
		return this.answerRepository.createOrUpdateAnswerByFieldId(userId, fieldId, data);
	}
}