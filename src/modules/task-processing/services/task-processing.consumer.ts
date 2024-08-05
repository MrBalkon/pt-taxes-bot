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
import { TaskProcessingJobName, TaskProcessingPayload } from '../task-processing.types';
import { TaskProcessingService } from './task.processing.service';
import { OperationService } from 'src/modules/operation/operation.service';
import { OperationStatus } from 'src/entities/operation.entity';
import { TaskProcessingQueueService } from './task-processing.queue';
import { TaskInputFieldsException, WrongCredentialsError } from '../task-processing.error';
import { QuestionService } from 'src/modules/question/question.service';
import { NotificaitonService } from 'src/modules/notification/notification.service';
import { NotificationAction } from 'src/modules/notification/notification.types';
import { EmptyFieldsError } from 'src/modules/question/question.error';
import { UserService } from 'src/modules/user/user.service';
import { TaskService } from 'src/modules/task/task.service';

@Processor(TASK_PROCESSING_QUEUE_NAME)
export class TaskProcessingQueueConsumer {
	private logger = new Logger(TaskProcessingQueueConsumer.name);
	constructor(
		@Inject(TaskProcessingService) private taskProcessingService: TaskProcessingService,
		private readonly operationService: OperationService,
		private readonly taskProcessingQueueService: TaskProcessingQueueService,
		private readonly questionService: QuestionService,
		private readonly notificaitonService: NotificaitonService,
		private readonly userService: UserService,
		private readonly taskService: TaskService,
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
			`[${job.id}] Failed to process task: ${job.id}, message: ${error.message}`,
		);
	}

	@Process({ concurrency: Number(process.env.QUEUE_CONCURRENCY) || 10 })
	async doProcessTask(
		task: Job<TaskProcessingPayload>,
		done: DoneCallback,
	): Promise<void> {
		const payload = task.data;

		this.logger.log(
			`[${payload.taskUid}] Start processing task: ${payload.type}`,
		);

		if (payload.userId) {
			payload.user = await this.userService.getUserWithAccesses(payload.userId);
		}

		try {
			await this.operationService.updateOperationStatus(payload.taskUid, OperationStatus.IN_PROGRESS);
			await this.taskProcessingService.processTask(payload);
			await this.operationService.updateOperationStatus(payload.taskUid, OperationStatus.SUCCESS);
			if (payload.taskExecutionPath?.length) {
				const [firstTask, ...otherTasks] = payload.taskExecutionPath;
				const childPayload = {
					...payload,
					parentTaskUid: payload.taskUid,
					type: firstTask,
					taskExecutionPath: otherTasks,
					userId: payload?.userId,
				}
				await this.taskProcessingQueueService.addQueueJob(childPayload);
			}
			done();
			return;
		} catch (e) {
			await this.operationService.updateOperationStatus(payload.taskUid, OperationStatus.FAIL, e.message);
			if (e instanceof TaskInputFieldsException) {
				const allowedTaskIds = payload?.user?.acessedTasks?.map((task) => task.id) || [];
				const tasksWithMissingFields = this.taskService.searchForTasksWithOutputFields(allowedTaskIds, e.fieldIds);

				if (tasksWithMissingFields?.length) {
					const firstTask = tasksWithMissingFields[0];
					await this.taskProcessingQueueService.addQueueJob({
						...payload,
						type: firstTask.systemName as TaskProcessingJobName,
						requestedFields: e.fields,
						 // Todo restart task after needed fields are filled
						// taskExecutionPath: [payload.type, ...payload.taskExecutionPath],
					});
				}
				done(e)
				return;
			}
			if (e instanceof WrongCredentialsError) {
				if (e?.fields?.length) {
					await this.questionService.deleteAnswerBulk(payload.userId, e.fields);
				}
				if (payload?.user) {
					await this.notificaitonService.sendNotification(payload?.user, e?.message, {
						action: NotificationAction.REQUEST_CREDENTIALS
					})
				}
				done(e);
				return;
			}
			if (e instanceof EmptyFieldsError) {
				if (payload?.user) {
					const errorMessage = "It's not enough information to process the task.\nPlease, fill all needed fields";
					await this.notificaitonService.sendNotification(payload?.user, errorMessage, {
						action: NotificationAction.REQUEST_CREDENTIALS
					});
				}
				done(e);
				return;
			}
			if (e instanceof HttpException) {
				this.logger.warn(
					`[${task.id}] Exception processing task: ${e.message}`,
				);
				done();
				return;
			}

			this.logger.error(e.message, e.stack);
			done(e);
		}
	}
}