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
import { TaskRetryPolicy } from 'src/entities/task-retry-policy.entity';
import { OperationService } from '../operation/operation.service';
import { DateTime } from 'luxon';
import { TaskSheduleService } from '../task-schedule/task-schedule.service';
import { CronPeriod, getCronPeriod } from '../task-schedule/utils';
import { TaskSheduleRepository } from 'src/repositories/task-shedule.repository';

const groupByOperationErrorType = group("operationErrorType")

@Injectable()
export class TaskService implements OnModuleInit {
	public tasksNameMap: Record<string, TaskWithChildrenIds> = {};
	constructor(
		@InjectDataSource() private connection: DataSource,
		private readonly taskRepository: TaskRepository,
		private readonly executionStepRepository: ExecutionStepRepository,
		private readonly fieldService: FieldService,
		private readonly operationsService: OperationService,
		private readonly taskSheduleRepository: TaskSheduleRepository,
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

	private async updateLocalTasksMap(manager: EntityManager = this.connection.manager) {
		const tasks = await manager
			.getRepository(Task)
			.createQueryBuilder('task')
			.leftJoinAndSelect('task.retryPolicies', 'retryPolicies')
			.leftJoinAndSelect('task.taskFields', 'taskFields')
			.leftJoinAndSelect('taskFields.field', 'field')
			.leftJoinAndSelect('task.outputFields', 'outputFields')
			.getMany();
		this.tasksNameMap = tasks.reduce((acc, task) => {
			const localTask = task as TaskWithChildrenIds;
			const retryPoliciesMap = task.retryPolicies.reduce((acc, retryPolicy) => {
				acc[retryPolicy.operationErrorType] = retryPolicy;
				return acc;
			}, {})
			localTask.retryPoliciesMap = retryPoliciesMap;
			acc[task.systemName] = localTask;
			return acc;
		}, {});
	}

	async getSystemMissedTasks() {
		const now = DateTime.now();

		const recurringSystemTaskShedules = await this.taskSheduleRepository.getRecurringSystemTasks();

		const systemTasksIds = recurringSystemTaskShedules.map((task) => (task.taskPayload as any)?.data?.splitTaskId);

		const taskSheduleMap = recurringSystemTaskShedules.reduce((acc, taskShedule) => {
			acc[taskShedule.taskId] = getCronPeriod(taskShedule.cronExpression);
			return acc;
		}, {})

		// get operatins for system tasks and define if we missed some of them based on period time
		const operations = await this.operationsService.getSystemOperationsByTaskIds(systemTasksIds);

		const missedOperations = operations.filter((operation) => {
			const taskShedule = taskSheduleMap[operation.taskId];

			if (!taskShedule) {
				return false;
			}

			const lastExecutionTime = DateTime.fromJSDate(operation.createdAt);

			switch (taskShedule.periodTime) {
				case CronPeriod.MONTHLY:
					return lastExecutionTime.month === now.month && now.day > taskShedule.day;
				case CronPeriod.QUARTERLY:
					return now.month - lastExecutionTime.month > 3;
				case CronPeriod.YEARLY:
					return now.year - lastExecutionTime.year > 1;
			}
		})

		console.log(missedOperations)
	}
}

export interface TaskWithChildrenIds extends Task {
	retryPoliciesMap: Record<string, TaskRetryPolicy>
}