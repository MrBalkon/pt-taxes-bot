import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { JobStatus, Queue } from 'bull';
import { TASK_PROCESSING_QUEUE_NAME } from '../task-processing.constants';
import { CleanJobsQuery, TaskProcessingPayload, TaskProcessingPayloadCall, TaskProcessingPayloadTemplate } from '../task-processing.types';
import { v4 as uuidV4 } from "uuid"
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class TaskProcessingQueueService {
  private logger = new Logger(TaskProcessingQueueService.name);
  constructor(
    @InjectQueue(TASK_PROCESSING_QUEUE_NAME)
    private queue: Queue<TaskProcessingPayloadTemplate<any>>,
	private userServices: UserService,
  ) {}

  async addJob<T>(telegramId: number, payload: TaskProcessingPayloadCall<T>) {
	const user = await this.userServices.getUserByTelegramId(String(telegramId));
	const uuid = uuidV4();
    this.logger.log(
      `[${uuid}] Received task: ${payload.type}`,
    );

    const job = await this.queue.getJob(uuid);

    if (!job) {
      this.logger.log(
        `[${uuid}] No existing job, creating new one`,
      );

      await this.addQueueJob({
		taskUid: uuid,
		userId: user.id,
		...payload
	  });
    } else if ((await job.getState()) === 'failed') {
      await job.retry();
    }
  }

  async addQueueJob<T>(jobData: TaskProcessingPayloadTemplate<T>) {
    await this.queue.add(jobData, {
      jobId: jobData.taskUid,
      removeOnComplete: true,
    });
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
}