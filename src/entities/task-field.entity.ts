import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Feature } from './feature.entity';
import { Task } from './task.entity';
import { UserField } from './user-field.entity';

export enum TaskFieldTimeRangeType {
	PREVIOUS_QUARTER = 'previous_quarter',
	PREVIOUS_MONTH = 'previous_month',
	PREVIOUS_YEAR = 'previous_year',
	YEAR_AGO = 'year_ago',
}

@Entity('tasks_fields')
export class TaskField {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('int', { name: 'task_id' })
	task_id: number;

	@Column('int', { name: 'field_id' })
	fieldId: number;

	@Column('boolean', { name: 'is_required', default: false })
	isRequired: boolean;

	@Column('enum', { name: 'time_range_type', enum: TaskFieldTimeRangeType, nullable: true })
	timeRangeType: TaskFieldTimeRangeType;

	// specify the name of the column that will be used to reference the user
	@ManyToOne(() => Task, (task) => task.taskFields)
	@JoinColumn({ name: "task_id" })
    task: Task

	@ManyToOne(() => UserField, (feature) => feature.taskFields)
	@JoinColumn({ name: "field_id" })
    field: UserField
}