import { TaskFieldTimeRangeType } from 'src/entities/task-field.entity';
import { Task } from 'src/entities/task.entity';

export interface TaskWithChildrenIds extends Task {
  childrenIds: number[];
}

export interface TaskFieldsSearch {
  fieldId: number;
  timeRangeType: TaskFieldTimeRangeType;
  isRequired: boolean;
}

export type TaskMetaFieldPermanent = string;

export type TaskMetaFieldPeriodic = {
  [year: string]: {
    [dateField: string]: TaskMetaFieldPermanent;
  };
};

export type TaskMetaField = TaskMetaFieldPermanent | TaskMetaFieldPeriodic;

export type TaskMetaFields = Record<string, TaskMetaField>;
