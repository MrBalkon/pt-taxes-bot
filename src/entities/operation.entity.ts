import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from './user.entity';

export enum OperationStatus {
	IN_PROGRESS='in_progress',
	SUCCESS='success',
	FAIL='fail'
}

@Entity('operations')
export class Operation {
	@PrimaryGeneratedColumn()
	id: number;

	@Column('int', { name: 'task_id' })
	taskId: number;

	@Column('int', { name: 'user_id', nullable: true })
	userId: number;

	@Column('varchar', { name: 'error', nullable: true })
	error: string | null;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@Column('enum', { name: 'status', enum: OperationStatus, default: OperationStatus.IN_PROGRESS })
	status: OperationStatus;

	// relations
	@ManyToOne(() => User, user => user.operations)
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(() => Task, task => task.operations)
	@JoinColumn({ name: 'task_id' })
	task: Task;
}