import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question, QuestionPeriodTime } from 'src/entities/question.entity';
import { UserAnswer } from 'src/entities/user-answer.entity';
import { FieldLifeSpanType, FieldValueType } from 'src/entities/user-field.entity';
import { FindQuestionResult } from 'src/repositories/queries/getPriorityQuestionQuery';
import { QuestionRepository } from 'src/repositories/question.repository';
import { UserAnswerRepository } from 'src/repositories/user-answer.repository';
import { getPreviousQuarter, getPreviousQuarterMonths, getPreviousQuarterYear } from 'src/utils/date';
import { DeepPartial, Repository } from 'typeorm';
import { CreateOrUdpdateFieldAnswer, UserMetaFieldsRequest, UserMetaFieldsRequestExtended } from './question.types';
import { UserFieldRepository } from 'src/repositories/user-field.repository';
import { EmptyFieldsError } from './question.error';
import { fieldsSerializer } from './questions.serializer';
import { TaskMetaFields } from '../task/task.types';

@Injectable()
export class QuestionService {
	constructor(
		private readonly questionRepository: QuestionRepository,
		private readonly answerRepository: UserAnswerRepository,
		private readonly userFieldRepository: UserFieldRepository
	) {}

	async getQuestionByUserIdAndFieldId(userId: number, fieldId: number) {
		return this.questionRepository.getQuestionByUserIdAndFieldId(userId, fieldId);
	}

	async getPriorityQuestion(userId: number) {
		return this.questionRepository.getPriorityQuestion(userId);
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

		return this.prepareAnswersSystemNameMap(answers);
	}

	async getUserMetaFields(userId: number, fieldSystemNames: UserMetaFieldsRequest[]) {
		if (!fieldSystemNames.length) {
			return {};
		}
		const systemNames = fieldSystemNames.map(fieldsSerializer.serializeUserFieldsRequest)
		const answers = await this.answerRepository.getAnswersByUserIdAndFieldSystemNames(userId, systemNames);

		const fieldsMap = this.prepareAnswersSystemNameMap(answers);

		this.validateAnswers(fieldsMap, fieldSystemNames);

		return fieldsMap;
	}

	prepareAnswersSystemNameMap(answers: any[]) {
		return this.prepareAnswersMapByProperty(answers, 'fieldSystemName');
	}

	prepareAnswersByIdMap(answers: any[]) {
		return this.prepareAnswersMapByProperty(answers, 'fieldId');
	}

	prepareAnswersMapByProperty(answers: any[], property: string): TaskMetaFields {
		return answers.reduce((acc, answer) => {
			const key = answer[property];
			if (answer.field === FieldValueType.ARRAY) {
				if (!acc[key]) {
					acc[key] = [];
				}
				acc[key].push(answer);
				return acc;
			}
			if (answer.fieldLifeSpanType == FieldLifeSpanType.MONTHLY) {
				if (!acc[key]) {
					acc[key] = {};
				}

				if (!acc[key][answer.year]) {
					acc[key][answer.year] = [];
				}

				acc[key][answer.year][answer.month] = answer;
				return acc;
			}
			acc[key] = answer;
			return acc;
		}, {});
	}

	private validateAnswers(answers: Record<string, any>, fieldSystemNames: UserMetaFieldsRequest[]) {
		const emptyFields = fieldSystemNames.filter((item) => {
			if (typeof item === 'string') {
				return false;
			}

			if (item.required) {
				return !answers[item.systemName];
			}

			return false
		}).map(fieldsSerializer.serializeUserFieldsRequest);

		if (emptyFields.length) {
			throw new EmptyFieldsError(emptyFields);
		}
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

	async saveAnswersBulkByFieldSystemName(userId: number, data: CreateOrUdpdateFieldAnswer[]) {
		const fields = await this.userFieldRepository.getUserFieldsBySystemNames(data.map((item) => item.fieldSystemName));

		const fieldsMap = fields.reduce((acc, field) => {
			acc[field.systemName] = field.id;
			return acc;
		}, {});

		const answers = data.map((item) => {
			return {
				userId,
				fieldId: fieldsMap[item.fieldSystemName],
				fieldValue: item.fieldValue,
				month: item.month,
				year: item.year,
			};
		});

		return this.answerRepository.createAnswerBulk(answers);
	}
}