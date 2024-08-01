import {
	Column,
	CreateDateColumn,
	Entity,
	Feature,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { UserAnswer } from './user-answer.entity';
import { FeatureAccess } from './feature-access.entity';
import { TaskShedule } from './task-schedule.entity';
import { Operation } from './operation.entity';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', { name: 'telegram_id' })
	telegramId: string

	@OneToMany(() => UserAnswer, userAnswer => userAnswer.user)
	answers: UserAnswer[];

	@Column('bool', { name: 'has_contract', default: false })
	hasContract: boolean;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@OneToMany(() => FeatureAccess, featureAccess => featureAccess.user)
	featureAccesses: FeatureAccess[];

	@OneToMany(() => TaskShedule, schedule => schedule.user)
	taskSchedules: TaskShedule[];

	@OneToMany(() => Operation, operation => operation.user)
	operations: Operation[];
}