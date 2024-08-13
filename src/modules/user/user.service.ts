import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { DataSource, DeepPartial, EntityManager } from 'typeorm';
import { UserWithAccesses } from './user.types';
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

  async getUserWithAccesses(
    userId: number,
    manager: EntityManager = this.connection.manager,
  ): Promise<UserWithAccesses> {
    const user = await this.getUserById(userId, manager);
    const userTasks = await this.taskService.getTasksByUserId(userId, manager);

    return {
      ...user,
      acessedTasks: userTasks,
    };
  }

  async getUserByTelegramId(
    telegramId: string,
    manager: EntityManager = this.connection.manager,
  ) {
    return manager.findOneBy(User, { telegramId });
  }

  async getAcessedUserByTelegramId(
    telegramId: string,
    manager: EntityManager = this.connection.manager,
  ) {
    return manager.findOneBy(User, { telegramId, hasContract: true });
  }

  async getUserById(
    id: number,
    manager: EntityManager = this.connection.manager,
  ) {
    return await manager.findOneBy(User, { id });
  }

  async updateUserById(
    id: number,
    data: DeepPartial<User>,
    manager: EntityManager = this.connection.manager,
  ) {
    const user = await this.getUserById(id);

    return manager.save(User, manager.merge(User, user, data));
  }

  async createUser(
    data: DeepPartial<User>,
    manager: EntityManager = this.connection.manager,
  ) {
    return manager.save(User, manager.create(User, data));
  }

  async updateUserByTelegramId(telegramId: string, data: DeepPartial<User>) {
    const user = await this.getUserByTelegramId(telegramId);

    return this.updateUserById(user.id, data);
  }

  async getUserIdsByTaskId(taskId: number) {
    return this.userRepository.getUserIdsByTaskId(taskId);
  }
}
