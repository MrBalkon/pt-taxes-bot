import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from 'src/entities/question.entity';
import { UserAnswer } from 'src/entities/user-answer.entity';
import { QuestionRepository } from 'src/repositories/question.repository';
import { UserAnswerRepository } from 'src/repositories/user-answer.repository';
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

	async saveAnswer(userId: number, fieldId: number, answer: string) {
		return this.answerRepository.createAnswer({
			userId,
			fieldId,
			fieldValue: answer,
		});
	}

	async getUserMetaFields(userId: number, systemName: string) {
		const answers = await this.answerRepository.getAnswersByUserIdAndTaskId(userId, systemName);

		return answers.reduce((acc, answer) => {
			acc[answer.fieldSystemName] = answer.fieldValue;
			return acc;
		}, {});
	}

	async setAnswerError(userId: number, fieldsSystemName: number, error: string) {
		return this.answerRepository.setAnswerError(userId, fieldsSystemName, error);
	}

	async deleteAnswer(userId: number, fieldsSystemName: string) {
		return this.answerRepository.deleteAnswer(userId, fieldsSystemName);
	}
}