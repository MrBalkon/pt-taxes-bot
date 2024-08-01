import {
	Column,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { ExecutionCommand } from './execution-command.entity';
import { ExecutionStep } from './execution-step.entity';
import { Task } from './task.entity';
import { ExecutionScenarionStep } from './execution-scenario-steps.entity';
import { ExecutionScenarionTask } from './execution-scenario-task.entity';

@Entity('execution_scenarios')
export class ExecutionScenario {
	@PrimaryGeneratedColumn({ name: 'execution_scenarion_id' })
	id: number;

	@Column('varchar', { name: 'name' })
	name: string;

	@OneToMany(() => ExecutionScenarionTask, executionScenarionTask => executionScenarionTask.executionScenario)
	scenarioTasks: ExecutionScenarionTask[];

	@OneToMany(() => ExecutionScenarionStep, executionScenarionStep => executionScenarionStep.executionScenario)
	scenarioSteps: ExecutionScenarionStep[];
}
