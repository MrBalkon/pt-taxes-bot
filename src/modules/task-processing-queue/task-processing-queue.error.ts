import { TaskFieldTimeRangeType } from "src/entities/task-field.entity";
import { User } from "src/entities/user.entity";
import { FieldWithTimeSpan } from "./task-processing.types";

export class TaskProcessingError extends Error {
	constructor(message) {
		super(message);
		this.name = 'TaskProcessingError';
	}
}

export class WrongCredentialsError extends TaskProcessingError {
	constructor(message, public fields?: string[]) {
		super(message)
	}
}

export class ServiceUnavailableError extends Error {
	constructor(serviceName: string) {
		super(`${serviceName} is unavailable`);
		this.name = 'TaskProcessingError';
	}
}

export class PageException extends TaskProcessingError {
	constructor(message) {
		super(message)
	}
}

export class TaskInputFieldsException extends TaskProcessingError {
	fields: FieldWithTimeSpan[];
	fieldIds: number[];
	constructor(fieldsRequest: FieldWithTimeSpan[]) {
		const message = `Task input fields are missing: ${fieldsRequest.map(field => field.fieldId).toString()}`;
		super(message)
		this.fieldIds = fieldsRequest.map(field => field.fieldId);
		this.fields = fieldsRequest;
	}
}