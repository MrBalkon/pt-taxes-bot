import { Injectable } from '@nestjs/common';
import { TaskService } from '../task/task.service';
import { TaskFieldRepository } from 'src/repositories/task-field.repository';
import { TaskOutputField } from 'src/entities/task-fields-output.entity';
import { TaskFieldSerializer } from './task-fields.serializer';

@Injectable()
export class TaskFieldsService {
  constructor(
    private taskFieldRepository: TaskFieldRepository,
    private taskFieldSerializer: TaskFieldSerializer,
  ) {}

  async getOutputFieldsByUserAndTaskId(taskId: number) {
    const outputFields =
      await this.taskFieldRepository.getOutputFieldsByTaskId(taskId);

    return this.taskFieldSerializer.serilizeFields(outputFields, 'fieldId');
  }
}
