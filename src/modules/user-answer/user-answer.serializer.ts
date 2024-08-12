import { UserAnswer } from "src/entities/user-answer.entity";
import { FieldLifeSpanType, UserField } from "src/entities/user-field.entity";
import { Injectable } from "@nestjs/common";
import { UserArgFieldsSerializer } from "../field/field.serializer";
import get from "lodash/get";

@Injectable()
export class UserAnswerSerializer extends UserArgFieldsSerializer<UserAnswer> {
	public getArgKey(answer: UserAnswer, field: UserField, property: string) {
		switch (field.fieldLifeSpanType) {
			case FieldLifeSpanType.PERMANENT:
				return get(answer,property);
			case FieldLifeSpanType.MONTHLY:
			case FieldLifeSpanType.QUARTERLY:
				return `"${get(answer,property)}"."${answer.year}"."${answer.month}"`;
		}
	}
}