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
  QUEUED = 'queued',
  IN_PROGRESS = 'in_progress',
  SUCCESS = 'success',
  FAIL = 'fail',
}

export enum OperationErrorType {
  RESOURCE_UNAVAILABLE = 'resource_unavailable',
  SYSTEM_ERROR = 'system_error',
  EXCEPTION = 'exception',
}

@Entity('operations')
export class Operation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int', { name: 'task_id' })
  taskId: number;

  @Column('int', { name: 'user_id', nullable: true })
  userId: number;

  @Column('varchar', { name: 'error', nullable: true })
  error: string | null;

  @Column('jsonb', { name: 'payload', nullable: true })
  payload: object | null;

  @Column('enum', {
    name: 'error_type',
    enum: OperationErrorType,
    nullable: true,
  })
  errorType: OperationErrorType;

  @Column('timestamp', { name: 'finished_at', nullable: true })
  finishedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column('enum', {
    name: 'status',
    enum: OperationStatus,
    default: OperationStatus.QUEUED,
  })
  status: OperationStatus;

  @Column('varchar', { name: 'parent_operation_id', nullable: true })
  parentOperationId: string;

  // relations
  @ManyToOne(() => User, (user) => user.operations)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Task, (task) => task.operations)
  @JoinColumn({ name: 'task_id' })
  task: Task;
}
