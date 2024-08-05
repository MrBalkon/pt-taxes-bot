import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskShedule, TaskSheduleType } from 'src/entities/task-schedule.entity';
import { Repository } from 'typeorm';
import { TaskProcessingQueueService } from '../task-processing-queue/task-processing-queue.service';
import { TaskProcessingJobName } from '../task-processing-queue/task-processing.types';
import { TaskSheduleRepository } from 'src/repositories/task-shedule.repository';
import { DateTime } from 'luxon'

@Injectable()
export class TaskSheduleService implements OnModuleInit {
	private logger = new Logger(TaskSheduleService.name);
	constructor(
		private readonly taskSheduleRepository: TaskSheduleRepository,
		private schedulerRegistry: SchedulerRegistry,
		private taskProcessingQueueService: TaskProcessingQueueService
	) {}

	@Cron(CronExpression.EVERY_30_MINUTES)
	async checkTaskUpdates() {
		await this.sheduleCronJobs();
	}

	@Cron(CronExpression.EVERY_10_SECONDS)
	async checkOneShotTasks() {
		await this.handleOneShotTasks();
	}

	async onModuleInit() {
		await this.sheduleCronJobs();
	}

	async handleUpdates() {
		await this.sheduleCronJobs();
		await this.handleOneShotTasks();
	}

	async handleOneShotTasks() {
		this.logger.log('Checking for one shot task updates');
		const taskShedules = await this.taskSheduleRepository.getOneShotTaskShedules();
		const tasksToExecute = []

		const now = DateTime.now();

		for (const taskShedule of taskShedules) {
			const taskTime = DateTime.fromJSDate(taskShedule.oneShotDate);

			if (now > taskTime) {
				tasksToExecute.push(taskShedule);
			}
		}

		if (!tasksToExecute.length) {
			this.logger.log('No one shot tasks to execute');
		} else {
			await this.addTaskToQueueBulk(tasksToExecute);
			const taskIds = tasksToExecute.map(task => task.id);
			await this.taskSheduleRepository.deleteOneShotTasksByIds(taskIds);	
		}

		return tasksToExecute;
	}

	async sheduleCronJobs() {
		this.logger.log('Checking for cron task updates');
		const taskShedules = await this.taskSheduleRepository.getRecurringTaskShedules();
		const sheduledTasks = []

		for (const taskShedule of taskShedules) {
			const taskName = taskShedule.task.systemName;

			try {
				this.schedulerRegistry.getCronJob(taskName)
				continue;
			} catch (error) {}
			// if (this.schedulerRegistry.getCronJob(taskName)) {
			// 	continue;
			// }

			const cronJob = new CronJob(taskShedule.cronExpression, async () => {
				this.logger.log(`Cron job ${taskName} executed`);

				await this.addTaskToQueue(taskShedule);

				this.logger.log(`Cron job ${taskName} added to queue`);
			})

			this.schedulerRegistry.addCronJob(taskName, cronJob);
			cronJob.start();
			sheduledTasks.push(taskName);
			this.logger.log(`Cron job ${taskName} added to scheduler`);
		}

		if (!sheduledTasks.length) {
			this.logger.log('No cron tasks to shedule');
		}

		return sheduledTasks;
	}

	private async addTaskToQueueBulk(taskShedules: TaskShedule[]) {
		const tasksPayloads = taskShedules.map(taskShedule => this.prepareTaskPayload(taskShedule))
		try {
			await this.taskProcessingQueueService.addQueueJobBulk<any>(tasksPayloads);
		} catch (error) {
			this.logger.error(`Error while adding jobs to queue: ${error.message}`);
		}
	}

	private async addTaskToQueue(taskShedule: TaskShedule) {
		const taskPayload = this.prepareTaskPayload(taskShedule);
		try {
			await this.taskProcessingQueueService.addQueueJob<any>(taskPayload);
		} catch (error) {
			this.logger.error(`Error while adding job to queue: ${error.message}`);
		}
	}

	private prepareTaskPayload(taskShedule: TaskShedule) {
		return {
			data: taskShedule.taskPayload,
			type: taskShedule.task.systemName as TaskProcessingJobName
		}
	}

	async createOneShotTaskShedule(taskId: number, taskPayload: any, oneShotDate: Date) {
		return this.taskSheduleRepository.createTaskShedule({
			taskId,
			taskPayload,
			oneShotDate,
			type: TaskSheduleType.ONE_SHOT
		});
	}

	// private async genNearestDayforcron() {
	// 	// cron range between 20th to 25th of every month
	// 	const cron = `0 0 20-25 * *`;
	// 	// cron range between 1 day of every quarter and last day of every second month of every quarter
	// 	const cron2 = `0 0 1-31/2 1-12/3 *`;
	// }

	// example cron 0 0 20-25 * *
	// example cron 0 0 1-31/2 1-12/3 *
	// private async checkIfDateInRangeOfCron(date: Date, cron: string) {
	// 	// const cron = cro
	// }
}
