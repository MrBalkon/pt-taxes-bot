import { Injectable } from "@nestjs/common";
import { ExecutionCommand } from "src/entities/execution-command.entity";
import { DataSource, EntityManager, Repository } from "typeorm";

@Injectable()
export class ExecutionCommandRepository extends Repository<ExecutionCommand> {
    constructor(
		private dataSource: DataSource
	)
    {
        super(ExecutionCommand, dataSource.createEntityManager());
    }

	async getExecutionCommandsByTaskSystemName(taskSystemName: string, manager: EntityManager = this.manager) {
		return manager.getRepository(ExecutionCommand)
			.createQueryBuilder('executionCommand')
			.leftJoin('executionCommand.executionSteps', 'executionSteps')
			.leftJoin('executionSteps.scenarioSteps', 'scenarioSteps')
			.leftJoin('scenarioSteps.executionScenario', 'executionScenario')
			.leftJoin('executionScenario.scenarioTasks', 'scenarioTasks')
			.leftJoinAndSelect('scenarioTasks.task', 'task')
			.where('task.systemName = :taskSystemName', { taskSystemName })
			.getMany();
	}

}