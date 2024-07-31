import { Module } from '@nestjs/common';
import { TaskSheduleService } from './task-schedule.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskShedule } from 'src/entities/task-schedule.entity';
import { TaskProcessingModule } from '../task-processing/task-processing.module';

@Module({
	imports: [
		ScheduleModule.forRoot(),
		TypeOrmModule.forFeature([TaskShedule]),
		TaskProcessingModule,
	],
	controllers: [],
	providers: [TaskSheduleService],
	exports: [TaskSheduleService],
})
export class TaskSheduleModule {};