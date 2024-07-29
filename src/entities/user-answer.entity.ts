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
import { User } from './user.entity';
import { UserField } from './user-field.entity';

@Entity('user-answers')
export class UserAnswer {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', { name: 'field_id' })
	fieldId: number;

	@Column('varchar', { name: 'user_id' })
	userId: number;

	@Column('varchar', { name: 'field_value' })
	fieldValue: string;

	@Column('int', { name: 'year', nullable: true })
	year: number;

	@Column('int', { name: 'month', nullable: true })
	month: number;

	@ManyToOne(() => UserField, userField => userField.answers)
	@JoinColumn({ name: "field_id" })
	field: UserField;

	@ManyToOne(() => User, user => user.answers)
	@JoinColumn({ name: "user_id" })
	user: User;

	@Column('varchar', { name: 'error', nullable: true })
	error?: string;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}