import { Injectable } from '@nestjs/common';
import { OperationRepository } from 'src/repositories/operation.repository';

@Injectable()
export class OperationService {
	constructor(
		private readonly operationRepository: OperationRepository
	) {}

	async createOperation(taskId: number, userId: number) {
		return this.operationRepository.save({
			taskId,
			userId,
		})
		
	}
}