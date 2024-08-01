import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Task } from 'src/entities/task.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class TaskService implements OnModuleInit {
	public tasksNameMap: Record<string, Task> = {};
	constructor(
		@InjectDataSource() private connection: DataSource,
	) {}

	async onModuleInit() {
		// TODO add cron to update if moved to dynamic selenium
		await this.updateLocalTasksMap();
	}

	async getTaskBySystemName(taskName: string) {
		return this.tasksNameMap[taskName];
	}

	async getTaskBySystemNameOrFail(taskName: string) {
		const task = this.tasksNameMap[taskName];
		if (!task) {
			throw new Error(`Task with system name ${taskName} not found`);
		}
		return task;
	}

	async getTaskById(taskId: number, manager: EntityManager = this.connection.manager) {
		return manager.getRepository(Task)
			.findOneBy({id: taskId});
	}

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

	private async updateLocalTasksMap(manager: EntityManager = this.connection.manager) {
		const tasks = await manager.getRepository(Task).find();
		this.tasksNameMap = tasks.reduce((acc, task) => {
			acc[task.systemName] = task;
			return acc;
		}, {});
	}
}