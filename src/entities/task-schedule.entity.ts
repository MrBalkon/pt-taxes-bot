import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
	OneToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { QuestionCondition } from './question-condition.entity';
import { Task } from './task.entity';
import { User } from './user.entity';

export enum TaskSheduleType {
	ONE_SHOT = 'one_shot',
	RECURRING = 'recurring',
}

@Entity('task-schedule')
export class TaskShedule {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('bool', { name: 'is_active', default: true })
	isActive: boolean;

	@Column('timestamp', { name: 'one_shot_date', nullable: true })
	oneShotDate: Date | null;

	@Column('enum', { name: 'type', enum: TaskSheduleType, default: TaskSheduleType.RECURRING })
	type: TaskSheduleType

	@Column('varchar', { name: 'cron_experssion', nullable: true })
	cronExpression: string | null;

	@Column('jsonb', { name: 'task_payload' })
	taskPayload: object;

	@Column('int', { name: 'task_id' })
	taskId: number;

	@Column('int', { name: 'user_id', nullable: true })
	userId: number;

	@ManyToOne(() => User, user => user.taskSchedules)
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(() => Task, task => task.taskSchedules)
	@JoinColumn({ name: 'task_id' })
	task: Task;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;
}