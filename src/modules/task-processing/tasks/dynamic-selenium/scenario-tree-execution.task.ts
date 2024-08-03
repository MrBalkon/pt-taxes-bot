import { ExecutionScenarionTask, ScenarionChildCondition } from "src/entities/execution-scenario-task.entity";
import { StepExecutionError, TaskExecution, TaskExecutionArgs } from "./task-execution";
import { ExecutionContext } from "./execution-context";
import { ExecutionCommand } from "src/entities/execution-command.entity";
import { ExecutionStep } from "src/entities/execution-step.entity";
import { Logger } from "@nestjs/common";
import { ExecutionScenario } from "src/entities/execution-scenario.entity";

export interface TreeTaskExecutionArgs extends TaskExecutionArgs {
	scenarioTasks: ExecutionScenarionTask[]
}

export class ScenarioExecutionError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'ScenarioExecutionError'
	}
}

const ROOT_SCENARIO_TASK_ID = 'root';

export class ScenarioTreeExecution extends TaskExecution {
	scenarioTasksMap: Record<string, ExecutionScenarionTask[]> = {}
	currentScenarioTask: ExecutionScenarionTask | null = null;
	constructor(args: TreeTaskExecutionArgs) {
		super(args);
		this.init(args.scenarioTasks);
	}

	async executeTask(): Promise<void> {
		while (this.currentScenarioTask) {
			if (!this.currentScenarioTask) {
				this.finish();
				return;
			}

			this.logger.log(`Executing scenario task: ${this.currentScenarioTask.id}`);

			await this.executeScenario(this.currentScenarioTask.executionScenario);

			const nextScenario = this.getNextScenarioTask();

			this.assignScenarioTask(nextScenario);
		}
	}

	private async executeScenario(currentScenario: ExecutionScenario) {
		const steps = currentScenario.scenarioSteps.map((scenarioStep) => scenarioStep.executionStep)

		try {
			await this.executeTaskSteps(steps);
		} catch (e) {
			if (currentScenario?.errorProduce) {
				this.executionContext.set(`exceptions.${currentScenario.errorProduce}`, true);
				return;
			}
			if (e instanceof StepExecutionError) {
				const message = `Failed to execute task scenario ${this.currentScenarioTask.id} step ${e.step.name} with error: ${e}`
				throw new ScenarioExecutionError(message);
			}

			throw e;
		}
	}

	private finish() {
		this.logger.log('Finished scenario tree execution');
	}

	private init(scenarioTasks: ExecutionScenarionTask[]) {
		this.logger.log(`Init scenario tree execution with ${scenarioTasks.length} tasks`);
		this.buildTree(scenarioTasks);
		this.currentScenarioTask = this.scenarioTasksMap[ROOT_SCENARIO_TASK_ID][0];
		this.logger.log(`Root scenario task: ${this.currentScenarioTask.id}`);
	}

	private assignScenarioTask(scenarioTask: ExecutionScenarionTask) {
		this.currentScenarioTask = scenarioTask;
	}

	private getNextScenarioTask() {
		const currentScenarioTask = this.currentScenarioTask;
		if (!currentScenarioTask) {
			return null;
		}

		const scenarioTasksCandidates = this.scenarioTasksMap[currentScenarioTask.id];
		if (!scenarioTasksCandidates) {
			return null;
		}

		const scenarioTask = this.chooseScenarionBasedOnConditions(scenarioTasksCandidates);

		return scenarioTask;
	}

	private chooseScenarionBasedOnConditions(scenarioTasks: ExecutionScenarionTask[]) : ExecutionScenarionTask | null {
		const scenario = scenarioTasks.find((scenarioTask) => {
			if (!scenarioTask.condition?.length) {
				return true;
			}
			for (const condition of scenarioTask.condition) {
				if(this.getConditionResult(condition)) {
					return true;
				}
			}
		})
		return scenario;

	}

	private getConditionResult(condition: ScenarionChildCondition) {
		let sourceValue = condition.sourceValue;
		if (condition.sourceContextValuePath) {
			sourceValue = this.executionContext.get(condition.sourceContextValuePath);
		}

		let targetValue = condition.targetValue;
		if (condition.targetContextValuePath) {
			targetValue = this.executionContext.get(condition.targetContextValuePath);
		}

		switch (condition.conditionOperator) {
			case '=':
			default:
				if (sourceValue === targetValue) {
					return true;
				}
				break;
		}
	}

	private buildTree(scenarioTasks: ExecutionScenarionTask[]) {
		scenarioTasks.forEach((scenarioTask) => {
			const key = scenarioTask.parentId || ROOT_SCENARIO_TASK_ID;
			if (!this.scenarioTasksMap[key]) {
				this.scenarioTasksMap[key] = []
			}
			this.scenarioTasksMap[key].push(scenarioTask);
		})
	}
}