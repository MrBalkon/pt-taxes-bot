
export enum TaxPaymentStatus {
	NOT_PAYED = 'not_payed',
	PAYED = 'payed',
}

export class TaxPayment {
	description: string;
	amount: string;
	dueDate: Date;
	link: string;
}