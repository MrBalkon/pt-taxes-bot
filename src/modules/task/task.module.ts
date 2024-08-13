import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/entities/task.entity';
import { TaskRepository } from 'src/repositories/task.repository';
import { ExecutionStep } from 'src/entities/execution-step.entity';
import { ExecutionStepRepository } from 'src/repositories/execution-step.repository';
import { FieldModule } from '../field/field.module';
import { TaskSheduleRepository } from 'src/repositories/task-shedule.repository';
import { OperationModule } from '../operation/operation.module';

@Module({
  imports: [
    OperationModule,
    FieldModule,
    TypeOrmModule.forFeature([Task, ExecutionStep]),
  ],
  controllers: [],
  providers: [
    TaskService,
    TaskRepository,
    ExecutionStepRepository,
    TaskSheduleRepository,
  ],
  exports: [TaskService],
})
export class TaskModule {}
