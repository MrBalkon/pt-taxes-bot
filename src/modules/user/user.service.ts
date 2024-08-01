import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Brackets, DataSource, DeepPartial, EntityManager, ObjectLiteral, Repository } from 'typeorm';
import { ConfigService } from '../config/config.service';
import { UserUpdate, UserWithMetaFields } from './user.types';
import { UserAnswerRepository } from 'src/repositories/user-answer.repository';
import { QuestionService } from '../question/question.service';
import { TaskService } from '../task/task.service';
import { UserRepository } from 'src/repositories/user.repository';

@Injectable()
export class UserService {
	constructor(
		private readonly userRepository: UserRepository,
		@InjectDataSource() private connection: DataSource,
		private questionService: QuestionService,
		private taskService: TaskService,
	) {}

	async getFullUserMetaById(id: number, fieldSystemNames: string[], manager: EntityManager = this.connection.manager): Promise<UserWithMetaFields> {
		const user = await this.getUserById(id, manager);
		const tasksMap = await this.taskService.getTasksMapByUserId(id, manager);
		const metaFields = await this.questionService.getUserMetaFields(id, fieldSystemNames);

		return {
			...user,
			metaFields,
			tasksMap,
		}
	}

	async getUserByTelegramId(telegramId: string, manager: EntityManager = this.connection.manager) {
		return manager.findOneBy(User, { telegramId });
	}

	async getAcessedUserByTelegramId(telegramId: string, manager: EntityManager = this.connection.manager) {
		return manager.findOneBy(User, { telegramId, hasContract: true });
	}

	async getUserById(id: number, manager: EntityManager = this.connection.manager) {
		return await manager.findOneBy(User, { id });
	}

	async updateUserById(id: number, data: DeepPartial<User>, manager: EntityManager = this.connection.manager) {
		const user = await this.getUserById(id);

		return manager.save(User, manager.merge(User, user, data));
	}

	async createUser(data: DeepPartial<User>, manager: EntityManager = this.connection.manager) {
		return manager.save(User, manager.create(User, data));
	}

	async updateUserByTelegramId(telegramId: string, data: DeepPartial<User>, manager: EntityManager = this.connection.manager) {
		const user = await this.getUserByTelegramId(telegramId);

		return this.updateUserById(user.id, data);
	}

	async getUserIdsByTaskId(taskId: number) {
		return this.userRepository.getUserIdsByTaskId(taskId);
	}
}