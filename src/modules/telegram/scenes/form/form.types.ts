import { Question } from "src/entities/question.entity";

export interface FormQuestion extends Question {
	children?: FormQuestion[];
}