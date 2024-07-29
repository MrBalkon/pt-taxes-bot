import {
	Column,
	CreateDateColumn,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { UserAnswer } from './user-answer.entity';
import { Feature } from './feature.entity';
import { UserField } from './user-field.entity';
import { FeatureTasks } from './feature-tasks.entity';

@Entity('tasks')
export class Task {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('varchar', { name: 'name' })
	name: string;

	@Column('varchar', { name: 'system_name' })
	systemName: string;

	@Column('varchar', { name: 'description', nullable: true })
	description?: string;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@ManyToMany(() => Feature, feature => feature.tasks)
	features: Feature[];

	@ManyToMany(() => UserField, "taskFields")
	@JoinTable({
	  name: "tasks_fields",
	  joinColumn: { name: "field_id" },
	  inverseJoinColumn: { name: "task_id" }
	})
	taskFields: UserField[];

	@OneToMany(() => FeatureTasks, featureAccess => featureAccess.feature)
	featureTasks: FeatureTasks[];
}