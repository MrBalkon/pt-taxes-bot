export class TaskProcessingError extends Error {
	constructor(message) {
		super(message);
		this.name = 'TaskProcessingError';
	}
}

export class WrongCredentialsError extends TaskProcessingError {
	constructor(message) {
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
