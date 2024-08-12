import { UserAnswer } from "src/entities/user-answer.entity";
import { UserMetaFieldsRequest } from "../question/question.types";
import { FieldLifeSpanType, FieldValueType, UserField } from "src/entities/user-field.entity";
import { Injectable } from "@nestjs/common";
import { FieldService } from "../field/field.service";
import set from "lodash/set";
import get from "lodash/get";
import { MetaFieldValue, MetaFields } from "../field/field.types";
import { TaskOutputField } from "src/entities/task-fields-output.entity";
import { UserArgFieldsSerializer } from "../field/field.serializer";
import { TaskFieldTimeRangeType } from "src/entities/task-field.entity";
import { getPreviousMonth, getPreviousMonthYear, getPreviousQuarterMonths, getPreviousQuarterYear } from "src/utils/date";

@Injectable()
export class TaskFieldSerializer extends UserArgFieldsSerializer<TaskOutputField> {
	public getArgs(arg: TaskOutputField, field: UserField, property: string): [string, MetaFieldValue<TaskOutputField>][] {
		switch (arg.timeRangeType) {
			case TaskFieldTimeRangeType.PREVIOUS_QUARTER_MONTHS:
				const previousQuarterYear = getPreviousQuarterYear();
				const previousQuarterMonth = getPreviousQuarterMonths();
				return previousQuarterMonth.map((month) => {
					return [`"${arg[property]}"."${previousQuarterYear}"."${month}"`, arg];
				})
			case TaskFieldTimeRangeType.PREVIOUS_YEAR:
				const previousYear = getPreviousQuarterYear();
				return [[`"${arg[property]}"."${previousYear}"`, arg]];
			case TaskFieldTimeRangeType.PREVIOUS_MONTH:
				const previousMonth = getPreviousMonth();
				const previousMonthYear = getPreviousMonthYear();
				return [[`${arg[property]}.${previousMonthYear}.${previousMonth}`, arg]];
			default:
				return [[`${arg[property]}`, arg]];
		}
	}
}