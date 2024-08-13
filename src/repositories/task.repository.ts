import { Injectable } from '@nestjs/common';
import { Task } from 'src/entities/task.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';

@Injectable()
export class TaskRepository extends Repository<Task> {
  constructor(private dataSource: DataSource) {
    super(Task, dataSource.createEntityManager());
  }

  async getTasksByUserId(
    userId: number,
    manager: EntityManager = this.manager,
  ) {
    return manager
      .getRepository(Task)
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.featureTasks', 'featureTasks')
      .leftJoinAndSelect('featureTasks.feature', 'feature')
      .leftJoinAndSelect('feature.featureAccesses', 'featureAccesses')
      .where('featureAccesses.userId = :userId', { userId })
      .getMany();
  }

  async getTaskStepsBySystemName(
    taskSystemName: string,
    manager: EntityManager = this.manager,
  ) {
    return manager
      .getRepository(Task)
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.executionScenarios', 'executionScenarios')
      .leftJoinAndSelect(
        'executionScenarios.executionScenario',
        'executionScenario',
      )
      .leftJoinAndSelect('executionScenario.scenarioSteps', 'scenarioSteps')
      .where('task.systemName = :taskSystemName', { taskSystemName })
      .orderBy('executionScenarios.order', 'ASC')
      .addOrderBy('scenarioSteps.order', 'ASC')
      .getMany();
  }
}
