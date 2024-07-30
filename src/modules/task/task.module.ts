import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from 'src/entities/task.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Task])],
	controllers: [],
	providers: [TaskService],
	exports: [TaskService],
})
export class TaskModule {};