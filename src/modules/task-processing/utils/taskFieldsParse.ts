import {
  TaskField,
  TaskFieldTimeRangeType,
} from 'src/entities/task-field.entity';
import { UserAnswer } from 'src/entities/user-answer.entity';
import { MetaField } from 'src/modules/field/field.types';

class TaskFieldParser {
  public userHasField(
    taskField: TaskField,
    userMetafield?: MetaField<UserAnswer>,
  ): boolean {
    // we dont validate optional fields
    if (!taskField.isRequired) {
      return true;
    }
    if (!userMetafield) {
      return false;
    }

    switch (taskField.timeRangeType) {
      case TaskFieldTimeRangeType.PREVIOUS_QUARTER:
      case TaskFieldTimeRangeType.PREVIOUS_YEAR:
      case TaskFieldTimeRangeType.PREVIOUS_MONTH:
        // TODO refactor this
        return true;
      // case TaskFieldTimeRangeType.YEAR_AGO:
      // 	const yearAgo = getPreviousYear() - 1
      // 	return Object.values(userMetafield[yearAgo])?.length === 12;
      default:
        return true;
    }
  }
}

export const taskFieldParser = new TaskFieldParser();
