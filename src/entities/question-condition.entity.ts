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
import { Question } from './question.entity';

export enum QuestionConditionOperator {
	EQUAL="=",
}

@Entity('questions-conditions')
export class QuestionCondition {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('integer', { name: 'source_question_id' })
	questionId: number

	@Column('varchar', { name: 'condition' })
	condition: QuestionConditionOperator

	@Column('integer', { name: 'compare_question_id', nullable: true })
	compareQuestionId: number

	@Column('varchar', { name: 'compare_value', nullable: true })
	compareValue: string | null

	@ManyToOne(() => Question, question => question.conditions)
	@JoinColumn({ name: "source_question_id" })
	question: Question
}