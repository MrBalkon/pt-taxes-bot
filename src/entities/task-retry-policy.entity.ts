import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserAnswer } from './user-answer.entity';
import { Feature } from './feature.entity';
import { UserField } from './user-field.entity';
import { FeatureTasks } from './feature-tasks.entity';
import { TaskShedule } from './task-schedule.entity';
import { Operation, OperationErrorType } from './operation.entity';
import { ExecutionScenario } from './execution-scenario.entity';
import { ExecutionScenarionTask } from './execution-scenario-task.entity';
import { TaskOutputField } from './task-fields-output.entity';
import { TaskField } from './task-field.entity';
import { DateTime } from 'luxon';
import { Task } from './task.entity';

export enum TaskRetryPolicyType {
  NO_RETRY = 'no_retry',
  RETRY_AFTER_HOURS = 'retry_after_hours',
  RETRY_IMMEDIATELY_TIMES = 'retry_immediately_times',
  RETRY_AFTER_DAYS = 'retry_after_days',
  RETRY_AFTER_WEEKS = 'retry_after_weeks',
}

@Entity('tasks_retry_policy')
export class TaskRetryPolicy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('enum', { name: 'operation_error_type', enum: OperationErrorType })
  operationErrorType: OperationErrorType;

  @Column('enum', {
    name: 'retry_policy',
    enum: TaskRetryPolicyType,
    default: TaskRetryPolicyType.NO_RETRY,
  })
  retryPolicy: TaskRetryPolicyType;

  @Column('varchar', { name: 'value' })
  value: string;

  @Column('int', { name: 'task_id' })
  taskId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // relations

  @ManyToOne(() => Task, (task) => task.retryPolicies)
  @JoinColumn({ name: 'task_id' })
  task: Task;
}
