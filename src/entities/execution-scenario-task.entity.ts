import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { ExecutionStep } from './execution-step.entity';
import { ExecutionScenario } from './execution-scenario.entity';
import { Task } from './task.entity';

@Entity('execution_scenarios_tasks')
export class ExecutionScenarionTask {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('int', { name: 'order' })
	order: number;

	@Column('varchar', { name: 'task_id' })
	taskId: number;

	@Column('varchar', { name: 'execution_scenario_id' })
	executionScenarionId: number;

	// specify the name of the column that will be used to reference the user
	@ManyToOne(() => Task, (step) => step.executionScenarios)
	@JoinColumn({ name: "task_id" })
    task: Task

	@ManyToOne(() => ExecutionScenario, (scenario) => scenario.scenarioSteps)
	@JoinColumn({ name: "execution_scenario_id" })
    executionScenario: ExecutionScenario
}