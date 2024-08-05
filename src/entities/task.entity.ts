import {
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { UserAnswer } from './user-answer.entity';
import { Feature } from './feature.entity';
import { UserField } from './user-field.entity';
import { FeatureTasks } from './feature-tasks.entity';
import { TaskShedule } from './task-schedule.entity';
import { Operation } from './operation.entity';
import { ExecutionScenario } from './execution-scenario.entity';
import { ExecutionScenarionTask } from './execution-scenario-task.entity';
import { TaskOutputField } from './task-fields-output.entity';
import { TaskField } from './task-field.entity';

export enum TaskType {
	ACTION = 'action',
	DATA_EXTRACTION = 'data_extraction',
}

export enum TaskLifespanType {
	PERIODIC = 'periodic',
	ON_DEMAND = 'on_demand',
}

export enum TaskExecutionType {
	NONE = 'none',
	INVOKE_MANAGER = 'invoke_manager',
}

@Entity('tasks')
export class Task {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', { name: 'name' })
	name: string;

	@Column('varchar', { name: 'system_name' })
	systemName: string;

	@Column('varchar', { name: 'description', nullable: true })
	description?: string;

	@Column('bool', { name: 'is_dynamic', default: false })
	isDynamic: boolean;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@Column('enum', { name: 'task_type', enum: TaskType, default: TaskType.DATA_EXTRACTION })
	type: TaskType;

	@Column('enum', { name: 'lifespan_type', enum: TaskLifespanType, default: TaskLifespanType.ON_DEMAND })
	lifespanType: TaskLifespanType;

	@Column('enum', { name: 'execution_type', enum: TaskExecutionType, default: TaskExecutionType.NONE })
	executionType: TaskExecutionType;

	// @Column('varchar', { name: 'task_type', nullable: true })
	// taskDateRestriction: string;

	// relations

	@OneToMany(() => TaskField, tf => tf.task)
	taskFields: TaskField[];

	@OneToMany(() => FeatureTasks, featureAccess => featureAccess.task)
	featureTasks: FeatureTasks[];

	@OneToMany(() => TaskShedule, schedule => schedule.task)
	taskSchedules: TaskShedule[];

	@OneToMany(() => Operation, operation => operation.task)
	operations: Operation[];

	@OneToMany(() => ExecutionScenarionTask, executionScenarionTask => executionScenarionTask.task)
	executionScenarios: ExecutionScenarionTask[];

	@OneToMany(() => TaskOutputField, tof => tof.task)
	outputFields: TaskOutputField[];
}