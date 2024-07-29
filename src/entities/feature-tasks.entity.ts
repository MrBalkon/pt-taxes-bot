import {
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Feature } from './feature.entity';
import { Task } from './task.entity';

@Entity('features-tasks')
export class FeatureTasks {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', { name: 'feature_id' })
	featureId: number;

	@Column('varchar', { name: 'task_id' })
	taskId: number;

	// specify the name of the column that will be used to reference the user
	@ManyToOne(() => Task, (task) => task.featureTasks)
	@JoinColumn({ name: "task_id" })
    Task: Task

	@ManyToOne(() => Feature, (feature) => feature.featureTasks)
	@JoinColumn({ name: "feature_id" })
    feature: Feature
}