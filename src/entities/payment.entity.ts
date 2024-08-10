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

export enum PaymentStatus {
	NOT_PAYED = 'not_payed',
	PAYED = 'payed',
}

@Entity('payment')
export class Payment {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column('varchar', { name: 'description' })
	description: string;

	@Column('varchar', { name: 'amount' })
	amount: string;

	@Column('int', { name: 'task_id' })
	taskId: number;

	@Column('int', { name: 'user_id' })
	userId: number;

	@Column('enum', { name: 'status', enum: PaymentStatus, default: PaymentStatus.NOT_PAYED })
	status: PaymentStatus;

	@Column('timestamp', { name: 'due_date', nullable: true })
	dueDate: Date;

	@Column('varchar', { name: 'link', nullable: true })
	link: string;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	// relations
	@ManyToOne(() => User, user => user.payments)
	@JoinColumn({ name: 'user_id' })
	user: User;

	@ManyToOne(() => Task, task => task.payments)
	@JoinColumn({ name: 'task_id' })
	task: Task;
}