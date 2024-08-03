import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { ExecutionStep } from './execution-step.entity';
import { ExecutionScenario } from './execution-scenario.entity';
import { Task } from './task.entity';

export enum ExecutionScenarioConditionType {
	SKIP = 'SKIP',
	STOP = 'STOP',
}

export interface ScenarionChildCondition extends Record<string, any> {
	sourceContextValuePath?: string
	sourceValue?: string
	targetContextValuePath?: string
	targetValue?: any
	conditionOperator?: string
}

@Entity('execution_scenarios_tasks')
export class ExecutionScenarionTask {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('int', { name: 'order', nullable: true })
	order: number;

	@Column('varchar', { name: 'task_id' })
	taskId: number;

	@Column('varchar', { name: 'execution_scenario_id' })
	executionScenarionId: number;

	@Column('int', { name: 'parent_id', nullable: true })
	parentId: number | null;

	@ManyToOne(() => ExecutionScenarionTask, stage => stage.children)
	@JoinColumn({ name: "parent_id" })
	parent: ExecutionScenarionTask | null;

	@OneToMany(() => ExecutionScenarionTask, stage => stage.parent)
	children: ExecutionScenarionTask[];

	@Column('jsonb', { name: 'condition', nullable: true })
	condition: ScenarionChildCondition[] | null;

	@ManyToOne(() => Task, (step) => step.executionScenarios)
	@JoinColumn({ name: "task_id" })
    task: Task

	@ManyToOne(() => ExecutionScenario, (scenario) => scenario.scenarioSteps)
	@JoinColumn({ name: "execution_scenario_id" })
    executionScenario: ExecutionScenario
}