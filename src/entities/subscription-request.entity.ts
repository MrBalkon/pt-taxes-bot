import {
	Column,
	Entity,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { UserSubscription } from './user-subscription.entity';
import { SubscriptionPackageFeature } from './subscription-feature.entity';

@Entity('subscription_requests')
export class SubscriptionPackage {
	@PrimaryGeneratedColumn()
	id: number;
}