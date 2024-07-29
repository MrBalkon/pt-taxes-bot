export class TaskProcessingError extends Error {
	constructor(message) {
		super(message);
		this.name = 'TaskProcessingError';
	}
}