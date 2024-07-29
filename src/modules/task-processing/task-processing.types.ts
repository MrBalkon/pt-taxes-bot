import { JobStatusClean } from "bull";
import { SocialSecurityTask } from "./tasks/social-security.task";

export enum TaskProcessingJobName {
	GOOGLE_EXAMPLE_COM = "SocialSecurityTask",
	TELEGRAM_NOTIFY = 'TelegramNotifyTask',
	CHECK_CRENDENTIALS = 'CheckCredentialsTask',
	SOCIAL_SECURITY_FILL_DECLARATION = 'SocialSecurityFillDeclarationTask',
}

export interface TaskProcessingPayloadCall<T> {
	type: TaskProcessingJobName;
	data: T
}

export interface TaskProcessingPayloadTemplate<T> extends TaskProcessingPayloadCall<T> {
	taskUid: string;
	userId: number;
}

export type TaskProcessingPayload = TaskProcessingPayloadTemplate<null>

export interface CleanJobsQuery {
	grace: number;
	status?: JobStatusClean;
	limit?: number;
  }

export interface Task {
	run: (task: TaskProcessingPayload) => Promise<void>;
}