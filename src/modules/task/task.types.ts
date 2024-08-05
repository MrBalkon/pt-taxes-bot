import { TaskFieldTimeRangeType } from "src/entities/task-field.entity";
import { Task } from "src/entities/task.entity";

export interface TaskWithChildrenIds extends Task {
	childrenIds: number[];
}

export interface TaskFieldsSearch {
	fieldId: number;
	timeRangeType: TaskFieldTimeRangeType;
	isRequired: boolean;
}