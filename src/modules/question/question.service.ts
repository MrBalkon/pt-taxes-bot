import { Injectable } from '@nestjs/common';
import { QuestionPeriodTime } from 'src/entities/question.entity';
import { UserAnswer } from 'src/entities/user-answer.entity';
import { FindQuestionResult } from 'src/repositories/queries/getPriorityQuestionQuery';
import { QuestionRepository } from 'src/repositories/question.repository';
import { UserAnswerRepository } from 'src/repositories/user-answer.repository';
import { getPreviousQuarter, getPreviousQuarterMonths, getPreviousQuarterYear } from 'src/utils/date';
import { DeepPartial } from 'typeorm';
import { UserFieldRepository } from 'src/repositories/user-field.repository';

@Injectable()
export class QuestionService {
	constructor(
		private readonly questionRepository: QuestionRepository,
		private readonly answerRepository: UserAnswerRepository,
		private readonly userFieldRepository: UserFieldRepository
	) {}

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

	async deleteAnswer(userId: number, fieldsSystemName: string) {
		return this.answerRepository.deleteAnswer(userId, fieldsSystemName);
	}

	async saveAnswerByFieldSystemName(userId: number, fieldSystemName: string, data: DeepPartial<UserAnswer>) {
		return this.answerRepository.createOrUpdateAnswerByFieldSystemName(userId, fieldSystemName, data);
	}

	async getQuestionsByFieldIds(fieldIds: number[]) {
		return this.questionRepository.getQuestionsByFieldIds(fieldIds);
	}
}