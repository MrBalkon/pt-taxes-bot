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

@Entity('features')
export class Feature {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', { name: 'name' })
	name: string;

	@Column('varchar', { name: 'description' })
	description: string;

	@ManyToMany(() => Task, task => task.features)
	tasks: Task[];

	@OneToMany(() => FeatureAccess, featureAccess => featureAccess.feature)
	featureAccesses: FeatureAccess[];

	@OneToMany(() => FeatureTasks, featureAccess => featureAccess.feature)
	featureTasks: FeatureTasks[];
}