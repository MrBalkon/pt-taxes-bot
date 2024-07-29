import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Brackets, DataSource, DeepPartial, EntityManager, ObjectLiteral, Repository } from 'typeorm';
import { ConfigService } from '../config/config.service';
import { UserUpdate } from './user.types';
import { UserAnswerRepository } from 'src/repositories/user-answer.repository';

@Injectable()
export class UserService {
	private encryptKey = null;
	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		private readonly configService: ConfigService,
		@InjectDataSource() private connection: DataSource,
		private asnwerRepository: UserAnswerRepository,
	) {
		this.encryptKey = this.configService.get('DB_ENCRYPT_KEY');
	}

	async getUserByTelegramId(telegramId: string, manager: EntityManager = this.connection.manager) {
		return manager.findOneBy(User, { telegramId });
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
}