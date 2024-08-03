import { Injectable } from "@nestjs/common";
import { ExecutionScenarionTask } from "src/entities/execution-scenario-task.entity";
import { DataSource, EntityManager, Repository } from "typeorm";

@Injectable()
export class ExecutionScenarioTaskRepository extends Repository<ExecutionScenarionTask> {
    constructor(
		private dataSource: DataSource
	)
    {
        super(ExecutionScenarionTask, dataSource.createEntityManager());
    }

	async getExecutionScenarioTasksByTaskSystemName(taskSystemName: string, manager: EntityManager = this.manager) {
		return manager.getRepository(ExecutionScenarionTask)
			.createQueryBuilder('scenarioTask')
			.leftJoinAndSelect('scenarioTask.executionScenario', 'scenario')
			.leftJoinAndSelect('scenario.scenarioSteps', 'scenarioSteps')
			.leftJoinAndSelect('scenario.scenarioTasks', 'scenarioTasks')
			.leftJoinAndSelect('scenarioSteps.executionStep', 'executionStep')
			.leftJoin('scenarioTasks.task', 'task')
			.where('task.systemName = :taskSystemName', { taskSystemName })
			.orderBy('scenarioSteps.order', 'ASC')
			.getMany();
	}

}