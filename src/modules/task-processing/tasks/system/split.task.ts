import { Injectable } from '@nestjs/common';
import {
  Task,
  TaskProcessingJobName,
  TaskProcessingPayloadCall,
  TaskProcessingPayloadTemplate,
} from '../../../task-processing-queue/task-processing.types';

import { UserService } from 'src/modules/user/user.service';
import { TaskProcessingQueueService } from '../../../task-processing-queue/task-processing-queue.service';
import { TaskService } from 'src/modules/task/task.service';

export interface SplitTaskData {
  splitTaskId: number;
  data?: any;
}
export type SplitTaskPayload = TaskProcessingPayloadTemplate<SplitTaskData>;

@Injectable()
export class SplitTask implements Task {
  constructor(
    private readonly userService: UserService,
    private readonly taskService: TaskService,
    private readonly taskProcessingQueueService: TaskProcessingQueueService,
  ) {}
  async run(task: SplitTaskPayload): Promise<void> {
    const queueTask = await this.taskService.getTaskById(task.data.splitTaskId);
    const userIds = await this.userService.getUserIdsByTaskId(
      task.data.splitTaskId,
    );

    const tasksPayloads: TaskProcessingPayloadCall<any>[] = userIds.map(
      (userId) => ({
        type: queueTask.systemName as TaskProcessingJobName,
        userId,
        data: {
          ...(task.data?.data || {}),
        },
        parentOperationId: task.taskUid,
      }),
    );

    await this.taskProcessingQueueService.addQueueJobBulk(tasksPayloads);
  }
}
