import { Injectable } from '@nestjs/common';
import { ExecutionStep } from 'src/entities/execution-step.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class ExecutionStepRepository extends Repository<ExecutionStep> {
  constructor(private dataSource: DataSource) {
    super(ExecutionStep, dataSource.createEntityManager());
  }

  async getExecutionStepsByTaskSystemName(
    taskSystemName: string,
    manager: EntityManager = this.manager,
  ) {
    return manager
      .getRepository(ExecutionStep)
      .createQueryBuilder('executionStep')
      .leftJoinAndSelect('executionStep.executionScenario', 'executionScenario')
      .leftJoinAndSelect('executionScenario.task', 'task')
      .where('task.systemName = :taskSystemName', { taskSystemName })
      .orderBy('executionScenario.order', 'ASC')
      .addOrderBy('executionStep.order', 'ASC')
      .getMany();
  }
}
