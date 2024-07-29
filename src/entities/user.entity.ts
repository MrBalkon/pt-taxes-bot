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

@Entity('users')
export class User {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', { name: 'telegram_id' })
	telegramId: string

	@OneToMany(() => UserAnswer, userAnswer => userAnswer.user)
	answers: UserAnswer[];

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@OneToMany(() => FeatureAccess, featureAccess => featureAccess.user)
	featureAccesses: FeatureAccess[];
}