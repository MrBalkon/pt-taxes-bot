import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/entities/task.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class TaskService {
	constructor(
		@InjectDataSource() private connection: DataSource,
	) {}

	async getTasksByUserId(userId: number, manager: EntityManager = this.connection.manager) {
		return manager.getRepository(Task)
			.createQueryBuilder('task')
			.leftJoinAndSelect('task.featureTasks', 'featureTasks')
			.leftJoinAndSelect('featureTasks.feature', 'feature')
			.leftJoinAndSelect('feature.featureAccesses', 'featureAccesses')
			.where('featureAccesses.userId = :userId', { userId })
			.getMany();
	}

	async getTasksMapByUserId(userId: number, manager: EntityManager = this.connection.manager) {
		const tasks = await this.getTasksByUserId(userId, manager);

		return tasks.reduce((acc, task) => {
			acc[task.systemName] = task;
			return acc;
		}, {});
	}
}