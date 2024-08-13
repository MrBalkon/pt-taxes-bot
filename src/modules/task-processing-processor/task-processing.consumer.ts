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
import { TASK_PROCESSING_QUEUE_NAME } from '../task-processing-queue/task-processing-queue.constants';
import {
  TaskProcessingJobName,
  TaskProcessingPayload,
} from '../task-processing-queue/task-processing.types';
import { TaskProcessingService } from '../task-processing/task.processing.service';
import { OperationService } from 'src/modules/operation/operation.service';
import {
  OperationErrorType,
  OperationStatus,
} from 'src/entities/operation.entity';
import { TaskProcessingQueueService } from '../task-processing-queue/task-processing-queue.service';
import {
  ServiceUnavailableError,
  TaskInputFieldsException,
  WrongCredentialsError,
} from '../task-processing-queue/task-processing-queue.error';
import { NotificaitonService } from 'src/modules/notification/notification.service';
import { NotificationAction } from 'src/modules/notification/notification.types';
import { EmptyFieldsError } from 'src/modules/question/question.error';
import { UserService } from 'src/modules/user/user.service';
import { TaskService } from 'src/modules/task/task.service';
import { Task, TaskExecutionType } from 'src/entities/task.entity';
import {
  TaskRetryPolicy,
  TaskRetryPolicyType,
} from 'src/entities/task-retry-policy.entity';
import { DateTime } from 'luxon';
import { TaskSheduleService } from '../task-schedule/task-schedule.service';
import { UserAnswerService } from '../user-answer/user-answer.service';

@Processor(TASK_PROCESSING_QUEUE_NAME)
export class TaskProcessingQueueConsumer {
  private logger = new Logger(TaskProcessingQueueConsumer.name);
  constructor(
    @Inject(TaskProcessingService)
    private taskProcessingService: TaskProcessingService,
    private readonly operationService: OperationService,
    private readonly taskProcessingQueueService: TaskProcessingQueueService,
    private readonly userAnswerService: UserAnswerService,
    private readonly notificaitonService: NotificaitonService,
    private readonly userService: UserService,
    private readonly taskService: TaskService,
    private readonly taskSheduleService: TaskSheduleService,
  ) {}

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
    const payload = { ...task.data };

    this.logger.log(
      `[${payload.taskUid}] Start processing task: ${payload.type}`,
    );

    if (payload.userId) {
      payload.user = await this.userService.getUserWithAccesses(payload.userId);
    }

    try {
      await this.operationService.updateOperationStatus(
        payload.taskUid,
        OperationStatus.IN_PROGRESS,
      );
      await this.taskProcessingService.processTask(payload);
      await this.operationService.updateOperationStatus(
        payload.taskUid,
        OperationStatus.SUCCESS,
      );
      if (payload.taskExecutionPath?.length) {
        const [firstTask, ...otherTasks] = payload.taskExecutionPath;
        const childPayload = {
          ...payload,
          parentTaskUid: payload.taskUid,
          type: firstTask,
          taskExecutionPath: otherTasks,
          userId: payload?.userId,
        };
        await this.taskProcessingQueueService.addQueueJob(childPayload);
      }
      done();
      return;
    } catch (e) {
      await this.handleError(task, payload, done, e);
    } finally {
      if (payload.executionType === TaskExecutionType.INVOKE_MANAGER) {
        await this.taskProcessingQueueService.addQueueJob({
          type: TaskProcessingJobName.TASK_MANAGER,
          userId: payload.userId,
          parentOperationId: payload.taskUid,
          data: undefined,
        });
      }
    }
  }

  private async handleError(
    task: Job<TaskProcessingPayload>,
    payload: TaskProcessingPayload,
    done: DoneCallback,
    e: Error,
  ) {
    const operationErrorType = this.getOperationErrorType(e);
    await this.operationService.updateOperationStatus(
      payload.taskUid,
      OperationStatus.FAIL,
      e.message,
      operationErrorType,
    );
    if (e instanceof ServiceUnavailableError) {
      if (payload?.user) {
        await this.notificaitonService.sendNotification(
          payload?.user,
          `🚨 ${e.message} 🚨`,
        );
      }
    }

    await this.handleTaskRetryPolicy(task, payload, operationErrorType);

    if (e instanceof TaskInputFieldsException) {
      const allowedTaskIds =
        payload?.user?.acessedTasks?.map((task) => task.id) || [];
      const tasksWithMissingFields =
        this.taskService.searchForTasksWithOutputFields(
          allowedTaskIds,
          e.fieldIds,
        );

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
      done(e);
      return;
    }
    if (e instanceof WrongCredentialsError) {
      if (e?.fields?.length) {
        await this.userAnswerService.deleteAnswerBulk(payload.userId, e.fields);
      }
      if (payload?.user) {
        await this.notificaitonService.sendNotification(
          payload?.user,
          e?.message,
          {
            action: NotificationAction.REQUEST_CREDENTIALS,
          },
        );
      }
      done(e);
      return;
    }
    if (e instanceof EmptyFieldsError) {
      if (payload?.user) {
        const errorMessage =
          "It's not enough information to process the task.\nPlease, fill all needed fields";
        await this.notificaitonService.sendNotification(
          payload?.user,
          errorMessage,
          {
            action: NotificationAction.REQUEST_CREDENTIALS,
          },
        );
      }
      done(e);
      return;
    }
    if (e instanceof HttpException) {
      this.logger.warn(`[${task.id}] Exception processing task: ${e.message}`);
      done();
      return;
    }

    this.logger.error(e.message, e.stack);
    done(e);
  }

  private async handleTaskRetryPolicy(
    task: Job<TaskProcessingPayload>,
    payload: TaskProcessingPayload,
    errorType: OperationErrorType,
  ) {
    this.logger.log(`[${task.data.taskUid}] Handling retry policy for task`);
    const dbTask = this.taskService.getTaskBySystemName(task.data.type);

    const retryPolicy = dbTask.retryPoliciesMap[errorType];
    if (!retryPolicy) {
      this.logger.log(`[${task.data.taskUid}] No retry policy found for task`);
      return;
    }
    this.logger.log(
      `[${task.data.taskUid}] Applying for task: ${retryPolicy.retryPolicy} with value = ${retryPolicy.value}`,
    );

    if (payload?.userId) {
      const tasksInFuture =
        await this.taskSheduleService.getUserOneShotTaskHigherThanDate(
          dbTask.id,
          payload?.userId,
          DateTime.now(),
        );

      if (tasksInFuture?.length) {
        this.logger.log(
          `[${task.data.taskUid}] Task already has retry in future`,
        );
        return;
      }
    }

    const result = await this.applyRetryPolicy(dbTask, task, retryPolicy);

    if (result && payload?.user) {
      await this.notificaitonService.sendNotification(payload?.user, result);
    }
  }

  private async applyRetryPolicy(
    dbTask: Task,
    task: Job<TaskProcessingPayload>,
    retryPolicy: TaskRetryPolicy,
  ): Promise<string | null> {
    const message = `🚨 We were unable to process automatic task "${dbTask.description} 🚨".\n\n`;
    switch (retryPolicy.retryPolicy) {
      case TaskRetryPolicyType.RETRY_AFTER_DAYS: {
        const daysValue = Number(retryPolicy.value);
        const retryDate = DateTime.now().plus({ days: daysValue });
        await this.taskSheduleService.createOneShotTaskShedule(
          dbTask.id,
          task.data,
          retryDate.toJSDate(),
        );
        return message + `🗓️ Task will be retried ${retryDate.toRelative()}`;
      }
      case TaskRetryPolicyType.RETRY_AFTER_HOURS: {
        const hoursValue = Number(retryPolicy.value);
        const retryDate = DateTime.now().plus({ hours: hoursValue });
        await this.taskSheduleService.createOneShotTaskShedule(
          dbTask.id,
          task.data,
          retryDate.toJSDate(),
        );
        return message + `🗓️ Task will be retried ${retryDate.toRelative()}`;
      }
      case TaskRetryPolicyType.RETRY_AFTER_WEEKS: {
        const weeksValue = Number(retryPolicy.value);
        const retryDate = DateTime.now().plus({ weeks: weeksValue });
        await this.taskSheduleService.createOneShotTaskShedule(
          dbTask.id,
          task.data,
          retryDate.toJSDate(),
        );
        return message + `🗓️ Task will be retried ${retryDate.toRelative()}`;
      }
      case TaskRetryPolicyType.RETRY_IMMEDIATELY_TIMES: {
        const timesValue = Number(retryPolicy.value);
        if (task.data.attemptsMade < timesValue) {
          const queueJob = {
            ...task.data,
            attemptsMade: task.data.attemptsMade + 1,
            parentOperationId: undefined,
          };
          await this.taskProcessingQueueService.addQueueJob(queueJob);
        }
        return message + `Task will be retried ${timesValue} times`;
      }
      case TaskRetryPolicyType.NO_RETRY:
      default:
        // return message + `Task will be retried after ${daysValue} days`;
        return null;
    }
  }

  private getOperationErrorType(e: Error): OperationErrorType {
    switch (e.constructor) {
      case TaskInputFieldsException:
      case WrongCredentialsError:
      case EmptyFieldsError:
        return OperationErrorType.EXCEPTION;
      case ServiceUnavailableError:
        return OperationErrorType.RESOURCE_UNAVAILABLE;
      default:
        return OperationErrorType.SYSTEM_ERROR;
    }
  }
}
