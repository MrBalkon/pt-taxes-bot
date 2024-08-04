import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { SubscriptionPackage } from './subscription-package.entity';
import { User } from './user.entity';

@Entity('user_subscriptions')
export class UserSubscription {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('int', { name: 'subscription_package_id' })
	subscriptionPackageId: number;

	@Column('int', { name: 'user_id' })
	userId: number;

	@Column('timestamp', { name: 'start_date' })
	startDate: Date;

	@Column('timestamp', { name: 'end_date', nullable: true })
	endDate: Date | null;

	@Column('bool', { name: 'service_provided', default: false })
	serviceProvided: boolean;

	// relations
	@ManyToOne(() => SubscriptionPackage, subscription => subscription.userSubscriptions)
	@JoinColumn({ name: 'subscription_package_id' })
	subscription: SubscriptionPackage;

	@ManyToOne(() => User, user => user.subscriptions)
	@JoinColumn({ name: 'user_id' })
	user: User;
}