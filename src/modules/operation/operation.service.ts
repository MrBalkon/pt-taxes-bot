import { Injectable } from '@nestjs/common';
import {
  Operation,
  OperationErrorType,
  OperationStatus,
} from 'src/entities/operation.entity';
import { OperationRepository } from 'src/repositories/operation.repository';
import { getCurrentYear } from 'src/utils/date';
import { DeepPartial, In } from 'typeorm';

@Injectable()
export class OperationService {
  constructor(private readonly operationRepository: OperationRepository) {}

  async getOperationById(operationId: string) {
    return this.operationRepository.findOneBy({ id: operationId });
  }

  async createOperationsBulk(data: DeepPartial<Operation>[]) {
    return this.operationRepository.save(data);
  }

  async createOperation(
    id: string,
    taskId: number,
    data: DeepPartial<Operation>,
  ) {
    return this.operationRepository.save({
      ...data,
      id,
      taskId,
      status: OperationStatus.QUEUED,
    });
  }

  async updateOperation(operationId: string, data: DeepPartial<Operation>) {
    return this.operationRepository.update(operationId, data);
  }

  async updateOperationStatus(
    operationId: string,
    status: OperationStatus,
    error?: string,
    errorType?: OperationErrorType,
  ) {
    return this.operationRepository.update(operationId, {
      status,
      error,
      errorType,
    });
  }

  async finishOpertaion(
    operationId: string,
    status: OperationStatus,
    error?: string,
  ) {
    return this.operationRepository.update(operationId, {
      status,
      finishedAt: new Date(),
      error,
    });
  }

  async getSystemOperationsByTaskIds(taskIds: number[]) {
    if (!taskIds?.length) {
      return [];
    }
    const year = getCurrentYear();
    return this.operationRepository
      .createQueryBuilder('operation')
      .where('operation.userId IS NULL')
      .andWhere(
        "COALESCE(operation.payload -> 'data' -> 'splitTaskId', NULL)::int IN (:...taskIds)",
        { taskIds },
      )
      .andWhere("date_part('year', created_at) = :year", { year })
      .getMany();
  }
}
