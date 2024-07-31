import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskShedule } from 'src/entities/task-schedule.entity';
import { Repository } from 'typeorm';
import { TaskProcessingQueueService } from '../task-processing/services/task-processing.queue';
import { TaskProcessingJobName } from '../task-processing/task-processing.types';

@Injectable()
export class TaskSheduleService implements OnModuleInit {
	private logger = new Logger(TaskSheduleService.name);
	constructor(
		@InjectRepository(TaskShedule)
		private readonly taskSheduleRepository: Repository<TaskShedule>,
		private schedulerRegistry: SchedulerRegistry,
		private taskProcessingQueueService: TaskProcessingQueueService
	) {}

	@Cron(CronExpression.EVERY_30_MINUTES)
	async checkTaskUpdates() {
		await this.sheduleCronJobs();
	}

	async onModuleInit() {
		await this.sheduleCronJobs()
	}

	async sheduleCronJobs() {
		this.logger.log('Checking for task updates');
		const taskShedules = await this.taskSheduleRepository.find({ relations: ['task'] });
		const sheduledTasks = []

		for (const taskShedule of taskShedules) {
			const { id } = taskShedule;

			const taskName = taskShedule.task.systemName;

			// if (this.schedulerRegistry.getCronJob(taskName)) {
			// 	continue;
			// }

			const cronJob = new CronJob(taskShedule.cronExpression, async () => {
				this.logger.log(`Cron job ${taskName} executed`);

				const taskPayload = {
					taskId: id,
					data: taskShedule.taskPayload,
					type: taskShedule.task.systemName as TaskProcessingJobName
				}
				try {
					await this.taskProcessingQueueService.addQueueJob<any>(taskPayload);
				} catch (error) {
					this.logger.error(`Error while adding job to queue: ${error.message}`);
				}

				this.logger.log(`Cron job ${taskName} added to queue`);
			})

			this.schedulerRegistry.addCronJob(taskName, cronJob);
			cronJob.start();
			sheduledTasks.push(taskName);
			this.logger.log(`Cron job ${taskName} added to scheduler`);
		}

		if (!sheduledTasks.length) {
			this.logger.log('No tasks to shedule');
		}

		return sheduledTasks;
	}
}