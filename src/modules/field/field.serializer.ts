import { FieldValueType, UserField } from "src/entities/user-field.entity";
import { Injectable } from "@nestjs/common";
import { FieldService } from "../field/field.service";
import set from "lodash/set";
import get from "lodash/get";
import { MetaFieldValue, MetaFields } from "../field/field.types";

@Injectable()
export class UserArgFieldsSerializer<T extends { fieldId: number }> {
	constructor(
		private readonly fieldService: FieldService,
	) {}

	serilizeFields(outputTaskFields: T[], property: string): MetaFields<T> {
		return outputTaskFields.reduce((metaFields, arg) => {
			const field = this.fieldService.getUserFieldById(arg.fieldId);

			const args = this.getArgs(arg, field, property);
			args.forEach((item) => {
				const key = item[0];
				const localArg = item[1];
				this.applyFieldType(metaFields, field, key, localArg);
			});

			return metaFields;
		}, {});
	}

	public getArgsKeys(args: T[], property: string): string[] {
		const keys = args.reduce((acc, arg) => {
			const field = this.fieldService.getUserFieldById(arg.fieldId)
			const args = this.getArgs(arg, field, property);
			const localKeys = args.map((item) => item[0]);
			return [...acc, ...localKeys];
		}, []);

		return keys;
	}

	public getArgs(arg: T, field: UserField, property: string): [string, MetaFieldValue<T>][] {
		const key = this.getArgKey(arg, field, property);
		return [[key, arg]]
	}

	public applyFieldType(metaFields: MetaFields<T>, field: UserField, key: string, arg: any): any {
		switch (field.valueType) {
			case FieldValueType.ARRAY:
				{
					const existingValue = get(metaFields, key, null);
					if (!existingValue) {
						set(metaFields, key, []);
					}
					// @ts-ignore
					get(metaFields, key).push(arg);
					break;
				}
			default:
				{
					set(metaFields, key, arg);
					break;
				}
		}
	}

	public getArgKey(arg: T, field: UserField, property: string): string {
		throw new Error('Not implemented');
	}
}