import {
	OnQueueError,
	OnQueueEvent,
	OnQueueFailed,
	OnQueueProgress,
	Process,
	Processor,
} from '@nestjs/bull';
import { HttpException, Inject, Logger } from '@nestjs/common';
import { DoneCallback, Job } from 'bull';
import { TASK_PROCESSING_QUEUE_NAME } from '../task-processing.constants';
import { TaskProcessingPayload } from '../task-processing.types';
import { TaskProcessingService } from './task.processing.service';
import { OperationService } from 'src/modules/operation/operation.service';
import { OperationStatus } from 'src/entities/operation.entity';

@Processor(TASK_PROCESSING_QUEUE_NAME)
export class TaskProcessingQueueConsumer {
	private logger = new Logger(TaskProcessingQueueConsumer.name);
	constructor(
		@Inject(TaskProcessingService) private taskProcessingService: TaskProcessingService,
		private readonly operationService: OperationService
	) { }

	@OnQueueEvent('completed')
	onQueueCompleted(job: Job<TaskProcessingPayload>) {
		this.logger.log(`[${job.id}] Completed task`);
	}

	@OnQueueProgress()
	onQueueProgress(job: Job<TaskProcessingPayload>) {
		this.logger.log(`[${job.id}] Progress task`);
	}

	@OnQueueError()
	onQueueError(error: Error) {
		this.logger.error(`Error processing task: ${error.message}`);
	}

	@OnQueueFailed()
	onQueueFailed(job: Job<TaskProcessingPayload>, error: Error) {
		this.logger.error(
			`[${job.id}] Failed to process task: ${job.id}`,
			error.stack,
		);
	}

	@Process({ concurrency: Number(process.env.QUEUE_CONCURRENCY) || 10 })
	async doProcessTask(
		task: Job<TaskProcessingPayload>,
		done: DoneCallback,
	): Promise<void> {
		const payload = task.data;

		this.logger.log(
			`[${task.id}] Start processing task: ${payload.type}`,
		);

		try {
			await this.operationService.updateOperationStatus(payload.taskUid, OperationStatus.IN_PROGRESS);
			await this.taskProcessingService.processTask(payload);
			await this.operationService.updateOperationStatus(payload.taskUid, OperationStatus.SUCCESS);
			done();
			return;
		} catch (e) {
			await this.operationService.updateOperationStatus(payload.taskUid, OperationStatus.FAIL, e.message);
			if (e instanceof HttpException) {
				this.logger.warn(
					`[${task.id}] Exception processing task: ${e.message}`,
				);
				done();
				return;
			}

			this.logger.error(e.message);
			done(e);
		}
	}
}