import { TaskField, TaskFieldTimeRangeType } from "src/entities/task-field.entity";
import { UserAnswer } from "src/entities/user-answer.entity";
import { MetaField } from "src/modules/field/field.types";
import { getPreviousQuarterYear, getPreviousQuarterMonths, getPreviousYear, getPreviousMonth } from "src/utils/date";

class TaskFieldParser {
	public userHasField(taskField: TaskField, userMetafield?: MetaField<UserAnswer>): boolean {
		// we dont validate optional fields
		if (!taskField.isRequired) {
			return true;
		}
		if (!userMetafield) {
			return false;
		}

		switch (taskField.timeRangeType) {
			case TaskFieldTimeRangeType.PREVIOUS_QUARTER:
				const previousQuarterYear = getPreviousQuarterYear();
				const previousQuarterMonth = getPreviousQuarterMonths();
				return previousQuarterMonth.every((month) => {
					return userMetafield[previousQuarterYear][month];
				})
			case TaskFieldTimeRangeType.PREVIOUS_YEAR:
				const previousYear = getPreviousYear()
				return Object.values(userMetafield[previousYear])?.length === 12;
			case TaskFieldTimeRangeType.PREVIOUS_MONTH:
				const previousMonth = getPreviousMonth()
				const previousMonthYear = getPreviousYear()
				return Object.values(userMetafield[previousMonthYear][previousMonth])?.length === 1;
			// case TaskFieldTimeRangeType.YEAR_AGO:
			// 	const yearAgo = getPreviousYear() - 1
			// 	return Object.values(userMetafield[yearAgo])?.length === 12;
			default:
				return true
		}
	}

}

export const taskFieldParser = new TaskFieldParser();