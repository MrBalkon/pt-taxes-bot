import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JobStatus, Queue } from 'bull';
import { TASK_PROCESSING_QUEUE_NAME } from '../task-processing.constants';
import { CleanJobsQuery, TaskProcessingPayload, TaskProcessingPayloadCall, TaskProcessingPayloadTemplate } from '../task-processing.types';
import { v4 as uuidV4 } from "uuid"
import { UserService } from 'src/modules/user/user.service';
import { OperationService } from 'src/modules/operation/operation.service';
import { TaskService } from 'src/modules/task/task.service';

@Injectable()
export class TaskProcessingQueueService {
  private logger = new Logger(TaskProcessingQueueService.name);
  constructor(
    @InjectQueue(TASK_PROCESSING_QUEUE_NAME)
    private queue: Queue<TaskProcessingPayloadTemplate<any>>,
    private userServices: UserService,
    private operationService: OperationService,
    private taskService: TaskService
  ) { }

  async addJobByTelegramId<T>(telegramId: number, payload: TaskProcessingPayloadCall<T>) {
    const user = await this.userServices.getUserByTelegramId(String(telegramId));

    if (!user) {
      throw new NotFoundException(`User with telegramId ${telegramId} not found`);
    }

    const jobData = {
      userId: user.id,
      ...payload
    }

    await this.addQueueJob(jobData);
  }

  async addQueueJobBulk<T>(tasksPayloads: TaskProcessingPayloadCall<T>[]) {
    const tasks = tasksPayloads.map((task) => {
      const taskUid = this.generateId();
      const data = {
        ...task,
        taskUid,
        systemTaskId: this.taskService.getTaskBySystemName(task.type).id
      }
      return {
        data,
        jobId: taskUid,
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 1
      }
    })
    await this.queue.addBulk(tasks);
    await this.operationService.createOperationsBulk(tasks.map((task) => ({
      id: task?.data?.taskUid,
      taskId: this.taskService.getTaskBySystemName(task?.data?.type).id,
      userId: task?.data?.userId,
      parentOperationId: task?.data?.parentOperationId
    })));
  }

  async addQueueJob<T>(jobData: TaskProcessingPayloadCall<T>) {
    const uuid = this.generateId();
    this.logger.log(
      `[${uuid}] Received task: ${jobData.type}`,
    );

    const job = await this.queue.getJob(uuid);

    if (!job) {
      this.logger.log(
        `[${uuid}] No existing job, creating new one`,
      );

      const systemTaskId = this.taskService.getTaskBySystemName(jobData.type).id;

      const payload = {
        ...jobData,
        taskUid: uuid,
        systemTaskId,
      }

      await this.queue.add(payload, {
        jobId: payload.taskUid,
        removeOnComplete: true,
        removeOnFail: true,
        attempts: 1,
      });
      await this.operationService.createOperation(uuid, systemTaskId, {
        userId: jobData?.userId,
        parentOperationId: jobData?.parentOperationId
      });
    } else if ((await job.getState()) === 'failed') {
      await job.retry();
    }
  }

  async getJobsList() {
    return this.queue.getJobs(['active', 'waiting', 'delayed', 'completed']);
  }

  async getJobStatus(
    eventUid: string,
  ): Promise<JobStatus | 'stuck' | undefined> {
    const job = await this.queue.getJob(eventUid);
    return job?.getState();
  }

  async retryJob(eventUid: string) {
    const job = await this.queue.getJob(eventUid);
    if (!job) {
      throw new NotFoundException(`Job ${eventUid} not found`);
    }
    return job?.retry();
  }

  async stopJob(eventUid: string) {
    const job = await this.queue.getJob(eventUid);
    if (!job) {
      throw new NotFoundException(`Job ${eventUid} not found`);
    }
    return job?.remove();
  }

  async deleteCompletedJobs(query: CleanJobsQuery) {
    await this.queue.clean(query.grace, query.status, query.limit);
  }

  private generateId() {
    return uuidV4();
  }
}