import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { UserField } from './user-field.entity';

export enum QuestionType {
	TEXT="text",
	OPTIONS="options",
}

@Entity('questions')
export class Question {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', { name: 'question' })
	question: string

	@Column('varchar', { name: 'description', nullable: true })
	description: string

	@Column('int', { name: 'rank', default: 0 })
	rank: number;

	@Column('varchar', { name: 'field_id' })
	fieldId: number;

	@OneToOne(() => UserField)
	@JoinColumn({ name: 'field_id' })
	field: UserField;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}