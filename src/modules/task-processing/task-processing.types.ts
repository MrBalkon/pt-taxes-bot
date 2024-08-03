import { JobStatusClean } from "bull";
import { SocialSecurityTask } from "./tasks/social-security.task";

export enum TaskProcessingJobName {
	GOOGLE_EXAMPLE_COM = "SocialSecurityTask",
	TELEGRAM_NOTIFY = 'TelegramNotifyTask',
	CHECK_CRENDENTIALS = 'CheckCredentialsTask',
	FINANCAIS_FILL_DATA = 'FinancaisFillData',
	SOCIAL_SECURITY_FILL_DECLARATION = 'SocialSecurityFillDeclarationTask',
}

export interface TaskProcessingPayloadCall<T> {
	type: TaskProcessingJobName;
	data: T
	userId?: number;
}

export interface TaskProcessingPayloadTemplate<T> extends TaskProcessingPayloadCall<T> {
	taskUid: string;
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