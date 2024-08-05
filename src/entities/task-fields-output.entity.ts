import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { UserField } from './user-field.entity';
import { TaskFieldTimeRangeType } from './task-field.entity';

@Entity('tasks_output_fields')
export class TaskOutputField {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('int', { name: 'task_id' })
	task_id: number;

	@Column('int', { name: 'field_id' })
	fieldId: number;

	@Column('enum', { name: 'time_range_type', enum: TaskFieldTimeRangeType, nullable: true })
	timeRangeType: TaskFieldTimeRangeType;

	// relations
	@ManyToOne(() => Task, (task) => task.outputFields)
	@JoinColumn({ name: "task_id" })
    task: Task

	@ManyToOne(() => UserField, (feature) => feature.taskOutputFields)
	@JoinColumn({ name: "field_id" })
    field: UserField
}