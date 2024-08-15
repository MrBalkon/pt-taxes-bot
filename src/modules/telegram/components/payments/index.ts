import { TelegramView } from '../base/view';

export interface PaymentViewProps {
  payments: {
    description: string;
    amount: string;
    dueDate: string;
    link?: string;
  }[];
}

export const PayementsView = TelegramView<PaymentViewProps>({
  text: `
		{{#if payments.length ~}}
			Here is the list of you payments:

			───────────────
			{{#each payments}}
				📝 {{description}}
				💵 Amount: <b>{{amount}}</b> €
				{{#if dueDate}}
					🗓️ Pay until: {{dueDate}}
				{{/if}}
				{{#if link}}
					🔗 <a href="{{link}}"><b>Pay here</b></a>
				{{/if}}
			───────────────
			{{/each}}
		{{else}}
			No payments found
		{{~/if}}
	`,
  extraGetter: () => ({
    parse_mode: 'HTML',
  }),
});
