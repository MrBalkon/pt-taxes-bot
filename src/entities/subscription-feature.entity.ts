import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Feature } from './feature.entity';
import { SubscriptionPackage } from './subscription-package.entity';

@Entity('subscription_package_features')
export class SubscriptionPackageFeature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'subscription_package_id' })
  subscriptionPackageId: number;

  @Column('int', { name: 'feature_id' })
  featureId: number;

  // specify the name of the column that will be used to reference the user
  @ManyToOne(
    () => SubscriptionPackage,
    (subscriptionPackage) => subscriptionPackage.subscriptionPackageFeatures,
  )
  @JoinColumn({ name: 'subscription_package_id' })
  subscriptionPackage: SubscriptionPackage;

  @ManyToOne(() => Feature, (feature) => feature.subscriptionPackageFeatures)
  @JoinColumn({ name: 'feature_id' })
  feature: Feature;
}
