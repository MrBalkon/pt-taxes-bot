import { FindQuestionResult } from "src/repositories/queries/getPriorityQuestionQuery";

export interface FormQuestion extends FindQuestionResult {
	children?: FormQuestion[];
}