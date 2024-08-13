import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { UserField } from './user-field.entity';
import { FieldCondition } from './field-condition.entity';

export enum QuestionPeriodTime {
	PREVIOUS_QUARTER_MONTHS="previous_quarter_months",
	PREVIOUS_QUARTER="previous_quarter",
	CURRENT_QUARTER="current_quarter",
}

@Entity('questions')
export class Question {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', { name: 'question' })
	question: string

	@Column('varchar', { name: 'period_time', nullable: true })
	periodTime: QuestionPeriodTime

	@Column('varchar', { name: 'description', nullable: true })
	description: string

	@Column('int', { name: 'rank', default: 0 })
	rank: number;

	@Column('varchar', { name: 'field_id' })
	fieldId: number;

	@ManyToOne(() => UserField, field => field.questions)
	@JoinColumn({ name: 'field_id' })
	field: UserField;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}