import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { ExecutionStep } from 'src/entities/execution-step.entity';
import { Task, TaskType } from 'src/entities/task.entity';
import { ExecutionStepRepository } from 'src/repositories/execution-step.repository';
import { TaskRepository } from 'src/repositories/task.repository';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { TaskFieldsSearch } from './task.types';
import { FieldService } from '../field/field.service';
import { TaskField, TaskFieldTimeRangeType } from 'src/entities/task-field.entity';
import { FieldLifeSpanType } from 'src/entities/user-field.entity';
import { group } from 'src/utils';

@Injectable()
export class TaskService implements OnModuleInit {
	public tasksNameMap: Record<string, TaskWithChildrenIds> = {};
	constructor(
		@InjectDataSource() private connection: DataSource,
		private readonly taskRepository: TaskRepository,
		private readonly executionStepRepository: ExecutionStepRepository,
		private readonly fieldService: FieldService,
	) {}

	async onModuleInit() {
		// TODO add cron to update if moved to dynamic selenium
		await this.updateLocalTasksMap();
	}

	async getTasks() {
		return this.taskRepository.find();
	}

	getLocalTasksByIds(ids: number[]) {
		return ids.map((id) => this.tasksNameMap[id]);
	}

	getTaskBySystemName(taskName: string) {
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

	async getFullTasksByUserId(userId: number, manager: EntityManager = this.connection.manager) {
		return manager.getRepository(Task)
			.createQueryBuilder('task')
			.leftJoinAndSelect('task.taskFields', 'taskFields')
			.leftJoinAndSelect('task.outputFields', 'outputFields')
			.leftJoinAndSelect('task.featureTasks', 'featureTasks')
			.leftJoin('featureTasks.feature', 'feature')
			.leftJoin('feature.featureAccesses', 'featureAccesses')
			.where('featureAccesses.userId = :userId', { userId })
			.getMany();
	}

	async getTasksByUserId(userId: number, manager: EntityManager = this.connection.manager) {
		return manager.getRepository(Task)
			.createQueryBuilder('task')
			.leftJoin('task.featureTasks', 'featureTasks')
			.leftJoin('featureTasks.feature', 'feature')
			.leftJoinAndSelect('feature.featureAccesses', 'featureAccesses')
			.where('featureAccesses.userId = :userId', { userId })
			.getMany();
	}

	async getTaskStepsBySystemName(taskSystemName: string, manager: EntityManager = this.connection.manager): Promise<ExecutionStep[]> {
		return this.executionStepRepository.getExecutionStepsByTaskSystemName(taskSystemName, manager);
	}

	searchForTasksWithOutputFields(userAllowedTaskIds: number[], outputFieldIds: number[]) {
		// ordered by count of found output fields
		return Object.values(this.tasksNameMap).filter((task) => {
			if (!userAllowedTaskIds.includes(task.id)) {
				return false;
			}
			return task.outputFields.some((taskOutputField) => outputFieldIds.includes(taskOutputField.fieldId));
		})
	}

	// searchForTasksWithNoInputFields(userAllowedTaskIds: number[], inputFields: TaskFieldsSearch[]) {
	// 	// ordered by count of found input fields
	// 	return Object.values(this.tasksNameMap).filter((task) => {
	// 			if (!userAllowedTaskIds.includes(task.id)) {
	// 				return false;
	// 			}
	// 			return task.taskFields.every((taskField) => !inputFields.includes(taskField.id));
	// 		}
	// 	)
	// }

	private searchTreeForTasks(): Task[] {
		const tasks = Object.values(this.tasksNameMap);
		const actionTasks = tasks.filter(task => task.type === TaskType.ACTION);

		const neededFieldIds = actionTasks.map(task => task.taskFields.map(taskField => taskField.fieldId)).flat();

		if (!neededFieldIds.length) {
			return actionTasks
		}


	}

	private async updateLocalTasksMap(manager: EntityManager = this.connection.manager) {
		const tasks = await manager
			.getRepository(Task)
			.createQueryBuilder('task')
			.leftJoinAndSelect('task.taskFields', 'taskFields')
			.leftJoinAndSelect('taskFields.field', 'field')
			.leftJoinAndSelect('task.outputFields', 'outputFields')
			.getMany();
		this.tasksNameMap = tasks.reduce((acc, task) => {
			acc[task.systemName] = task;
			return acc;
		}, {});
	}
}

export interface TaskWithChildrenIds extends Task {
	
}