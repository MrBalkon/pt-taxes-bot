import { TaskFieldTimeRangeType } from 'src/entities/task-field.entity';
import { TaskOutputField } from 'src/entities/task-fields-output.entity';
import { FieldLifeSpanType, UserField } from 'src/entities/user-field.entity';
import { TaskFieldsSearch } from './task.types';

const TIME_RANGE_COMPARE = {
  [TaskFieldTimeRangeType.PREVIOUS_QUARTER]: [
    TaskFieldTimeRangeType.PREVIOUS_QUARTER,
    TaskFieldTimeRangeType.PREVIOUS_YEAR,
    TaskFieldTimeRangeType.YEAR_AGO,
  ],
  [TaskFieldTimeRangeType.PREVIOUS_MONTH]: [
    TaskFieldTimeRangeType.PREVIOUS_QUARTER,
    TaskFieldTimeRangeType.PREVIOUS_MONTH,
    TaskFieldTimeRangeType.PREVIOUS_YEAR,
    TaskFieldTimeRangeType.YEAR_AGO,
  ],
  [TaskFieldTimeRangeType.PREVIOUS_YEAR]: [
    TaskFieldTimeRangeType.PREVIOUS_YEAR,
  ],
  [TaskFieldTimeRangeType.YEAR_AGO]: [TaskFieldTimeRangeType.YEAR_AGO],
};

const TIME_RANGE_COMPARE_MAP = Object.entries(TIME_RANGE_COMPARE).reduce(
  (acc, [key, value]) => {
    value.forEach((val) => {
      if (!acc[key]) {
        acc[key] = {};
      }
      acc[key][val] = true;
    });
    return acc;
  },
  {},
);

export const compareTaskFields = (
  originalField: UserField,
  fieldA: TaskFieldsSearch,
  fieldB: TaskOutputField,
) => {
  if (originalField.fieldLifeSpanType == FieldLifeSpanType.PERMANENT) {
    return true;
  }

  const timeRangeTypeA = fieldA.timeRangeType;
  const timeRangeTypeB = fieldB.timeRangeType;

  const timeRangeTypeACompare =
    TIME_RANGE_COMPARE_MAP?.[timeRangeTypeA]?.[timeRangeTypeB];

  return timeRangeTypeACompare;
};
