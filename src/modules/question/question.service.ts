import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question, QuestionPeriodTime } from 'src/entities/question.entity';
import { UserAnswer } from 'src/entities/user-answer.entity';
import { FindQuestionResult } from 'src/repositories/queries/getPriorityQuestionQuery';
import { QuestionRepository } from 'src/repositories/question.repository';
import { UserAnswerRepository } from 'src/repositories/user-answer.repository';
import { getPreviousQuarterMonths, getPreviousQuarterYear } from 'src/utils/date';
import { Repository } from 'typeorm';

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

		if (question.periodTime === QuestionPeriodTime.PREVIOUS_QUARTER) {
			if (!Array.isArray(answer)) {
				throw new Error('Answer should be an array');
			}
			const previousQuarterMonths = getPreviousQuarterMonths()
			const previousQuarterYear = getPreviousQuarterYear()

			for (const previousQuarterMonth of previousQuarterMonths) {
				answers.push({
					userId,
					fieldId: question.fieldId,
					fieldValue: answer,
					month: previousQuarterMonth,
					year: previousQuarterYear,
				});
			}
		}

		return this.answerRepository.createAnswerBulk(answers);
	}

	async getUserMetaFields(userId: number, systemName: string) {
		const answers = await this.answerRepository.getAnswersByUserIdAndTaskId(userId, systemName);

		return answers.reduce((acc, answer) => {
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
}