import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { UserField } from './user-field.entity';
import { User } from './user.entity';
import { FeatureAccess } from './feature-access.entity';
import { FeatureTasks } from './feature-tasks.entity';
import { SubscriptionPackageFeature } from './subscription-feature.entity';

@Entity('features')
export class Feature {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { name: 'name' })
  name: string;

  @Column('varchar', { name: 'description' })
  description: string;

  @OneToMany(() => FeatureAccess, (featureAccess) => featureAccess.feature)
  featureAccesses: FeatureAccess[];

  @OneToMany(() => FeatureTasks, (featureAccess) => featureAccess.feature)
  featureTasks: FeatureTasks[];

  @OneToMany(
    () => SubscriptionPackageFeature,
    (subscriptionPackageFeature) => subscriptionPackageFeature.feature,
  )
  subscriptionPackageFeatures: SubscriptionPackageFeature[];
}
