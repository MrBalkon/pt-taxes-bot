import { Injectable } from '@nestjs/common';
import { UserAnswerRepository } from 'src/repositories/user-answer.repository';
import { UserAnswerSerializer } from './user-answer.serializer';
import { FieldService } from '../field/field.service';
import { CreateOrUdpdateFieldAnswer } from './user-answer.types';
import { FieldValueType, UserAnswer } from 'src/entities/user-answer.entity';
import { DeepPartial } from 'typeorm';
import isEqual from 'lodash/isEqual';

@Injectable()
export class UserAnswerService {
	constructor(
		private readonly answerRepository: UserAnswerRepository,
		private readonly userAnswerSerializer: UserAnswerSerializer,
		private readonly userFieldService: FieldService,
	) {}

	async getUserAnswers(userId: number) {
		const answers = await this.answerRepository.getAnswersByUserId(userId);
		return this.userAnswerSerializer.serilizeFields(answers, 'fieldId');
	}

	async getUserAnswersPathsByFieldsIds(userId: number, fieldIds: number[]) {
		const answers = await this.answerRepository.getAnswersByUserIdAndFieldIds(userId, fieldIds);
		return this.userAnswerSerializer.getArgsKeys(answers, 'fieldId');
	}

	async getUserMetaFieldsByIds(userId: number, fieldIds: number[]) {
		const answers = await this.answerRepository.getAnswersByUserIdAndFieldIds(userId, fieldIds);

		return this.userAnswerSerializer.serilizeFields(answers, 'field.systemName');
	}

	async getUserAllMetaFieldsByTaskIds(userId: number, inputTaskIds: number[]) {
		if (!inputTaskIds.length) {
			return {};
		}
		const answers = await this.answerRepository.getAnswersByInputTaskIds(userId, inputTaskIds);

		return this.userAnswerSerializer.serilizeFields(answers, 'fieldId');
	}

	async getUserAllMetaFieldsSystemNameByTaskIds(userId: number, inputTaskIds: number[]) {
		if (!inputTaskIds.length) {
			return {};
		}
		const answers = await this.answerRepository.getAnswersByInputTaskIds(userId, inputTaskIds);

		return this.userAnswerSerializer.serilizeFields(answers, 'field.systemName');
	}

	async saveAnswersBulkByFieldSystemName(userId: number, data: CreateOrUdpdateFieldAnswer[]) {
		const answers = data.map((item) => {
			return {
				userId,
				fieldId: this.userFieldService.getUserFieldByName(item.fieldSystemName).id,
				fieldValue: item.fieldValue,
				month: item.month,
				year: item.year,
			};
		});

		return this.answerRepository.createAnswerBulk(answers);
	}

	async answersSyncByFieldSystemName(userId: number, fieldSystemName: string, fieldValues: FieldValueType[]) {
		const field = this.userFieldService.getUserFieldByName(fieldSystemName);
		const existingAnswers = await this.answerRepository.getAnswersByUserIdAndFieldIds(userId, [field.id]);

		const data = fieldValues.map((item) => {
			return {
				fieldValue: item,
				userId,
				fieldId: field.id,
			};
		})
		// find answers that are not in the new list
		const answersToDelete = existingAnswers.filter((existingAnswer) => {
			return !data.find((newAnswer) => isEqual(newAnswer.fieldValue, existingAnswer.fieldValue));
		});

		// find answers that are not in the old list
		const answersToCreate = data.filter((newAnswer) => {
			return !existingAnswers.find((existingAnswer) => isEqual(newAnswer.fieldValue, existingAnswer.fieldValue));
		});

		// delete old answers
		await this.answerRepository.remove(answersToDelete);

		// create new answers
		await this.answerRepository.createAnswerBulk(answersToCreate);

		return {
			answersToDelete,
			answersToCreate,
		};
	}
}