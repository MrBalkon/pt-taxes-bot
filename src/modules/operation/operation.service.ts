import { Injectable } from '@nestjs/common';
import { Operation, OperationErrorType, OperationStatus } from 'src/entities/operation.entity';
import { OperationRepository } from 'src/repositories/operation.repository';
import { DeepPartial } from 'typeorm';

@Injectable()
export class OperationService {
	constructor(
		private readonly operationRepository: OperationRepository,
	) {}

	async getOperationById(operationId: string) {
		return this.operationRepository.findOneBy({ id: operationId })
	}

	async createOperationsBulk(data: DeepPartial<Operation>[]) {
		return this.operationRepository.save(data)
	}

	async createOperation(id: string, taskId: number, data: DeepPartial<Operation>) {
		return this.operationRepository.save({
			...data,
			id,
			taskId,
			status: OperationStatus.QUEUED,
		})
	}

	async updateOperation(operationId: string, data: DeepPartial<Operation>) {
		return this.operationRepository.update(operationId, data)
	}

	async updateOperationStatus(operationId: string, status: OperationStatus, error?: string, errorType?: OperationErrorType) {
		return this.operationRepository.update(operationId, {
			status,
			error,
			errorType
		})
	}

	async finishOpertaion(operationId: string, status: OperationStatus, error?: string) {
		return this.operationRepository.update(operationId, {
			status,
			finishedAt: new Date(),
			error,
		})
	}
}