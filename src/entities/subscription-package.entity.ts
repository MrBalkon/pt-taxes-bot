import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserSubscription } from './user-subscription.entity';
import { SubscriptionPackageFeature } from './subscription-feature.entity';

export enum SubscriptionPeriodType {
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
  ONCE = 'once',
  FOREVER = 'forever',
}

@Entity('subscription_packages')
export class SubscriptionPackage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { name: 'name' })
  name: string;

  @Column('varchar', { name: 'description' })
  description: string;

  // if paymentSystemId is null, then it's a manually added subscription
  @Column('varchar', { name: 'payment_system_id', nullable: true })
  paymentSystemId: string | null;

  @Column('enum', { name: 'period_type', enum: SubscriptionPeriodType })
  periodType: SubscriptionPeriodType;

  @Column('int', { name: 'price', nullable: true })
  price: number | null;

  // @Column('timestamp', { name: 'start_date' })
  // startDate: Date;

  // @Column('timestamp', { name: 'end_date', nullable: true })
  // endDate: Date | null;

  // relations

  @OneToMany(
    () => UserSubscription,
    (userSubscription) => userSubscription.subscription,
  )
  userSubscriptions: UserSubscription[];

  @OneToMany(
    () => SubscriptionPackageFeature,
    (subscriptionPackageFeature) =>
      subscriptionPackageFeature.subscriptionPackage,
  )
  subscriptionPackageFeatures: SubscriptionPackageFeature[];
}
