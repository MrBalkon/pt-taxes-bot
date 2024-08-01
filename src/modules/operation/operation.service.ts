import { Injectable } from '@nestjs/common';
import { Operation, OperationStatus } from 'src/entities/operation.entity';
import { OperationRepository } from 'src/repositories/operation.repository';
import { DeepPartial } from 'typeorm';
import { TaskService } from '../task/task.service';

@Injectable()
export class OperationService {
	constructor(
		private readonly operationRepository: OperationRepository,
		private readonly taskService: TaskService
	) {}

	async createOperationsBulk(data: DeepPartial<Operation>[]) {
		return this.operationRepository.save(data)
	}

	async createOperationByTaskSystemName(id: string, taskSystemName: string, userId?: number | null) {
		const task = await this.taskService.getTaskBySystemNameOrFail(taskSystemName)

		return this.createOperation(id, task.id, userId)
	}

	async createOperation(id: string, taskId: number, userId?: number | null) {
		return this.operationRepository.save({
			id,
			taskId,
			userId,
			status: OperationStatus.QUEUED,
		})
	}

	async updateOperationStatus(operationId: string, status: OperationStatus, error?: string) {
		return this.operationRepository.update(operationId, {
			status,
			error
		})
	}

	async updateOperationsByTaskSystemName(taskSystemName: string, status: OperationStatus, error?: string) {
		const task = await this.taskService.getTaskBySystemNameOrFail(taskSystemName)

		return this.operationRepository.update({ taskId: task.id }, {
			status,
			error
		})
	}

	async finishOpertaion(operationId: string, status: OperationStatus, error?: string) {
		return this.operationRepository.update(operationId, {
			status,
			finishedAt: new Date(),
			error,
		})
	}

	async finishOperationsByTaskSystemName(taskSystemName: string, status: OperationStatus, error?: string) {
		const task = await this.taskService.getTaskBySystemNameOrFail(taskSystemName)

		return this.operationRepository.update({ taskId: task.id }, {
			status,
			finishedAt: new Date(),
			error
		})
	}
}