import {
	Column,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { ExecutionCommand } from './execution-command.entity';
import { ExecutionScenario } from './execution-scenario.entity';
import { ExecutionScenarionStep } from './execution-scenario-steps.entity';

export interface ExecutionPath {
	executionSource: string
	executionMethod?: string
}

export interface ExecutionArgument extends Record<string, any> {
	value?: any
	contextValuePath?: string
	executionPath?: ExecutionPath[]
}

export interface ExecutionArguments extends Record<string, any> {
	methodArgs?: ExecutionArgument[]
	resultNamePath?: string
	executionSource?: string
}

@Entity('execution_steps')
export class ExecutionStep {
	@PrimaryGeneratedColumn({ name: 'execution_step_id' })
	id: number;

	@Column('varchar', { name: 'name' })
	name: string;

	@Column('varchar', { name: 'description', nullable: true })
	description: string;

	@Column('int', { name: 'execution_command_id' })
	executionCommandId: number;

	@Column('jsonb', { name: 'execution_arguments' })
	executionArguments: ExecutionArguments

	@ManyToOne(() => ExecutionCommand, field => field.executionSteps)
	@JoinColumn({ name: 'execution_command_id' })
	executionCommand: ExecutionCommand

	@OneToMany(() => ExecutionScenarionStep, executionScenarionStep => executionScenarionStep.executionStep)
	scenarioSteps: ExecutionScenarionStep[];
}
