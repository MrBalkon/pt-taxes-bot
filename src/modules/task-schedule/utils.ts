import { DateTime } from "luxon";

export enum CronPeriod {
	MONTHLY = 'monthly',
	QUARTERLY = 'quarterly',
	YEARLY = 'yearly',
}

export const getCronPeriod = (cronExpression: string) => {
	const sections = cronExpression.split(' ');
	if (sections[2] === '*' && sections[3] === '*') {
		return CronPeriod.MONTHLY;
	}

	if (sections[2] !== '*' && sections[3] !== '*') {
		return CronPeriod.QUARTERLY;
	}

	return CronPeriod.YEARLY;
}