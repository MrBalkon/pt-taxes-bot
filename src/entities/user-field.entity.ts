import {
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Feature } from './feature.entity';
import { Task } from './task.entity';
import { UserAnswer } from './user-answer.entity';

export enum FieldLifeSpanType {
	PERMANENT = 'permanent',
	PERIODIC = 'periodic',
}

export enum FieldValueType {
	TEXT="text",
	FLOAT="FLOAT",
	OPTIONS="options",
}

export interface FieldOption {
	text: string;
	value: string;
}

@Entity('user-fields')
export class UserField {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', { name: 'field_name' })
	fieldName: string;

	@Column('varchar', { name: 'system_name' })
	systemName: string;

	@Column('varchar', { name: 'field_life_span_type' })
	fieldLifeSpanType: FieldLifeSpanType

	@Column('varchar', { name: 'fields_value_type' })
	valueType: FieldValueType

	@Column({
        type: 'jsonb',
        array: false,
        default: () => "'[]'",
        nullable: false,
    })
    options!: Array<FieldOption>;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@OneToMany(() => UserAnswer, userAnswer => userAnswer.field)
	answers: UserAnswer[];

	@ManyToMany(() => Task, "taskFields")
	@JoinTable({
	  name: "tasks_fields",
	  joinColumn: { name: "field_id" },
	  inverseJoinColumn: { name: "task_id" }
	})
	taskFields: Task[];
}