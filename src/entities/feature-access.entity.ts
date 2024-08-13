import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Feature } from './feature.entity';

@Entity('features-access')
export class FeatureAccess {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { name: 'user_id' })
  userId: number;

  @Column('varchar', { name: 'feature_id' })
  featureId: number;

  // specify the name of the column that will be used to reference the user
  @ManyToOne(() => User, (user) => user.featureAccesses)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Feature, (feature) => feature.featureAccesses)
  @JoinColumn({ name: 'feature_id' })
  feature: Feature;
}
