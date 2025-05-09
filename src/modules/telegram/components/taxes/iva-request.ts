import { TelegramView } from '../base/view';

export interface IvaRequestViewProps {
  quarter: string;
  totalToPaySum: string;
  deductionsSum: string;
  totalToPayAfterDeductionsSum: string;
}

export const IvaRequestView = TelegramView<IvaRequestViewProps>({
  text: `
		❗ We've successfully prepared your Periodic IVA declaration for {{quarter}} quarter to submit.
		❗ Please review the data and confirm the submission.
		💳 Total to pay: <b>{{totalToPaySum}}</b> €
		🧮 Deductions: <b>{{deductionsSum}}</b> €
		{{#if deductionsSum}}
			🤑 Total to pay after deductions: <b>{{totalToPayAfterDeductionsSum}}</b> €
		{{/if}}
	`,
  extraGetter: () => ({
    parse_mode: 'HTML',
  }),
});
