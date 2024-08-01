export enum QuestionType {
	FLOAT="float",
	TEXT="text",
	OPTIONS="options",
}

export interface Question {
	question: string;
	type: QuestionType;
	field: string;
	details?: string;
	options?: { text: string, value: string }[];
}

export const QUESTIONS_AND_FIELDS: Question[] = [
	{
		question: "Please, fill your NISS:",
		type: QuestionType.TEXT,
		field: "niss",
	},
	{
		question: "Please, fill your Seg Social passowrd:",
		details: "(This is the password you use to login to <a href=\"https://app.seg-social.pt/ptss/\">Seg Social</a>)",
		type: QuestionType.TEXT,
		field: "segSocialPassword",
	},
	{
		// TODO rewrite this question
		question: "What's your type of work?",
		type: QuestionType.OPTIONS,
		options: [
			{
				text: "Employee (Categoria A)",
				value: "A",
			},
			{
				text: "Individual Enterpreneur / Trabalhadores independentes (Categoria B)",
				value: "B",
			}
		],
		field: "typeOfWork",
	}
]
