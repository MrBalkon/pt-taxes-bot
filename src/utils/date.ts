export interface DateParameters {
	year: number;
	month: number;
}

// months:
// 1 - January
// 2 - February
// 3 - March
// ...

export const getPreviousQuarterYear = (): number => {
	const currentQuarter = getCurrentQuarter();

	if (currentQuarter === 1) {
		return getCurrentYear() - 1;
	}

	return getCurrentYear();
}

export const getPreviousQuarterMonths = (): number[] => {
	const previousQuarter = getPreviousQuarter();

	return getQuarterMonths(previousQuarter);
}

export const getPreviousQuarterMonthsNames = (): string[] => {
	const previousQuarterMonths = getPreviousQuarterMonths();

	return previousQuarterMonths.map(month => getMonthNameByNumber(month));
}

export const getQuarterMonths = (quarter: number): number[] => {
	switch (quarter) {
		case 1:
			return [1, 2, 3];
		case 2:
			return [4, 5, 6];
		case 3:
			return [7, 8, 9];
		case 4:
			return [10, 11, 12];
		default:
			throw new Error('Invalid quarter');
	}
}

export const getCurrentQuarter = (): number => {
	const month = new Date().getMonth() + 1;

	if (month <= 3) {
		return 1;
	} else if (month <= 6) {
		return 2;
	} else if (month <= 9) {
		return 3;
	} else {
		return 4;
	}
}

export const getPreviousQuarter = (): number => {
	const currentQuarter = getCurrentQuarter();

	if (currentQuarter === 1) {
		return 4;
	}

	return currentQuarter - 1;
}

export const getCurrentYear = (): number => {
	return new Date().getFullYear();
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
export const getMonthNameByNumber = (monthNumber: number): string => {
	return MONTHS[monthNumber - 1];
}