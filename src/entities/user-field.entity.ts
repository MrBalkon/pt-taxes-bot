import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Feature } from './feature.entity';
import { Task } from './task.entity';
import { UserAnswer } from './user-answer.entity';
import { Question } from './question.entity';
import { TaskOutputField } from './task-fields-output.entity';
import { TaskField } from './task-field.entity';

export enum FieldLifeSpanType {
	PERMANENT = 'permanent',
	MONTHLY = 'monthly',
	QUARTERLY = 'quarterly',
	YEARLY = 'yearly',
}

export enum FieldValueType {
	TEXT="text",
	ARRAY='array',
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

	@Column('enum', { name: 'field_life_span_type', enum: FieldLifeSpanType, default: FieldLifeSpanType.PERMANENT })
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

	@OneToMany(() => TaskField, tf => tf.field)
	taskFields: TaskField[];

	@OneToMany(() => Question, question => question.field)
	questions: Question[];

	@OneToMany(() => TaskOutputField, tof => tof.field)
	taskOutputFields: TaskOutputField[];
}