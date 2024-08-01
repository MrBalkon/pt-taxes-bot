import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ExecutionStep } from "./execution-step.entity";

export enum ExecutionCommandMethod {
	GO_PAGE = 'get',
	FIND_ELEMENT_BY = 'findElement',
	SEND_KEYS = 'sendKeys',
}

@Entity('execution_commands')
export class ExecutionCommand {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', { name: 'name' })
	name: string;

	@Column('varchar', { name: 'description', nullable: true })
	description: string;

	@Column('varchar', { name: 'execution_source' })
	executionSource: string

	@Column('varchar', { name: 'execution_method' })
	method: ExecutionCommandMethod

	@OneToMany(() => ExecutionStep, question => question.executionCommand)
	executionSteps: ExecutionStep[];
}
