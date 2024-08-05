import { JobStatusClean } from "bull";
import { SocialSecurityTask } from "../task-processing/tasks/social-security.task";
import { User } from "src/entities/user.entity";
import { UserWithAccesses } from "../user/user.types";
import { TaskFieldTimeRangeType } from "src/entities/task-field.entity";

export enum TaskProcessingJobName {
	GOOGLE_EXAMPLE_COM = "SocialSecurityTask",
	TELEGRAM_NOTIFY = 'TelegramNotifyTask',
	CHECK_CRENDENTIALS = 'CheckCredentialsTask',
	FINANCAIS_FILL_DATA = 'FinancaisFillData',
	SOCIAL_SECURITY_FILL_DECLARATION = 'SocialSecurityFillDeclarationTask',
	TASK_MANAGER = 'TaskManagerService',
}

export interface FieldWithTimeSpan {
	fieldId: number;
	timeRange?: TaskFieldTimeRangeType;
}

export interface TaskProcessingPayloadCall<T> {
	type: TaskProcessingJobName;
	data: T
	userId?: number;
	taskExecutionPath?: TaskProcessingJobName[];
	parentOperationId?: string;
	requestedFields?: FieldWithTimeSpan[];
}

export interface TaskProcessingPayloadTemplate<T> extends TaskProcessingPayloadCall<T> {
	systemTaskId: number;
	taskUid: string;
	user?: UserWithAccesses;
	metaFields?: Record<string, any>
}

export type TaskProcessingPayload = TaskProcessingPayloadTemplate<null>

export interface CleanJobsQuery {
	grace: number;
	status?: JobStatusClean;
	limit?: number;
  }

export enum TaskProcessingResultStatus {
	SUCCESS = "SUCCESS",
	SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
	WRONG_CREDENTIALS = "WRONG_CREDENTIALS",
}

export interface TaskProcessingResultNotification {
	message: string
	meta?: any
}

export interface TaskProcessingResult {
	notification?: TaskProcessingResultNotification;
	status: TaskProcessingResultStatus
}

export interface Task {
	run: (task: TaskProcessingPayload) => Promise<void>;
}