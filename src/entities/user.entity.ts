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
import { UserSubscription } from './user-subscription.entity';
import { Payment } from './payment.entity';

export enum UserRole {
	ADMIN = 'admin',
	USER = 'user'
}

@Entity('users')
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', { name: 'telegram_id' })
	telegramId: string

	@Column('bool', { name: 'has_contract', default: false })
	hasContract: boolean;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@Column('enum', { name: 'role', enum: UserRole, default: UserRole.USER })
	role: UserRole;

	//relations
	@OneToMany(() => UserAnswer, userAnswer => userAnswer.user)
	answers: UserAnswer[];

	@OneToMany(() => FeatureAccess, featureAccess => featureAccess.user)
	featureAccesses: FeatureAccess[];

	@OneToMany(() => TaskShedule, schedule => schedule.user)
	taskSchedules: TaskShedule[];

	@OneToMany(() => Operation, operation => operation.user)
	operations: Operation[];

	@OneToMany(() => UserSubscription, subscription => subscription.user)
	subscriptions: UserSubscription[];

	@OneToMany(() => Payment, p => p.user)
	payments: Payment[];
}