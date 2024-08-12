import { Injectable } from '@nestjs/common';
import { UserAnswerRepository } from 'src/repositories/user-answer.repository';
import { UserAnswerSerializer } from './user-answer.serializer';

@Injectable()
export class UserAnswerService {
	constructor(
		private readonly answerRepository: UserAnswerRepository,
		private readonly userAnswerSerializer: UserAnswerSerializer,
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
}