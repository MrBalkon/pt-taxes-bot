import {
	Column,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { ExecutionScenarionStep } from './execution-scenario-steps.entity';
import { ExecutionScenarionTask } from './execution-scenario-task.entity';

export interface ExecutionScenarioParameters extends Record<string, any> {}

@Entity('execution_scenarios')
export class ExecutionScenario {
	@PrimaryGeneratedColumn({ name: 'execution_scenarion_id' })
	id: number;

	@Column('varchar', { name: 'name' })
	name: string;

	@Column('varchar', { name: 'error_produce', nullable: true })
	errorProduce?: string | null;

	@Column('jsonb', { name: 'parameters', default: {} })
	parameters: ExecutionScenarioParameters

	@OneToMany(() => ExecutionScenarionTask, executionScenarionTask => executionScenarionTask.executionScenario)
	scenarioTasks: ExecutionScenarionTask[];

	@OneToMany(() => ExecutionScenarionStep, executionScenarionStep => executionScenarionStep.executionScenario)
	scenarioSteps: ExecutionScenarionStep[];
}
