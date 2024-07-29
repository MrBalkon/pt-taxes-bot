import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Question } from 'src/entities/question.entity';
import { UserAnswer } from 'src/entities/user-answer.entity';
import { QuestionRepository } from 'src/repositories/question.repository';
import { Repository } from 'typeorm';

@Injectable()
export class QuestionService {
	constructor(
		private readonly questionRepository: QuestionRepository,
		@InjectRepository(UserAnswer)
		private readonly answerRepository: Repository<UserAnswer>,
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
		return this.answerRepository.save({
			userId,
			fieldId,
			fieldValue: answer,
		});
	}
}