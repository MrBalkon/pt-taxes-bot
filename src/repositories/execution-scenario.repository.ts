import { Injectable } from "@nestjs/common";
import { ExecutionScenario } from "src/entities/execution-scenario.entity";
import { DataSource, EntityManager, Repository } from "typeorm";

@Injectable()
export class ExecutionScenarioRepository extends Repository<ExecutionScenario> {
    constructor(
		private dataSource: DataSource
	)
    {
        super(ExecutionScenario, dataSource.createEntityManager());
    }

	async getExecutionScenariosByTaskSystemName(taskSystemName: string, manager: EntityManager = this.manager) {
		return manager.getRepository(ExecutionScenario)
			.createQueryBuilder('scenario')
			.leftJoinAndSelect('scenario.scenarioSteps', 'scenarioSteps')
			.leftJoinAndSelect('scenario.scenarioTasks', 'scenarioTasks')
			.leftJoinAndSelect('scenarioSteps.executionStep', 'executionStep')
			.leftJoin('scenarioTasks.task', 'task')
			.where('task.systemName = :taskSystemName', { taskSystemName })
			.orderBy('scenarioSteps.order', 'ASC')
			.addOrderBy('scenarioTasks.order', 'ASC')
			.getMany();
	}

}