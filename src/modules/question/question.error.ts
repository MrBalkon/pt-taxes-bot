export class EmptyFieldsError extends Error {
	constructor(fields: string[]) {
		super(`Fields ${fields.join(', ')} should not be empty`);
	}
}