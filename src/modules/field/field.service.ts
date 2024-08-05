import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserField } from 'src/entities/user-field.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FieldService implements OnModuleInit {
	private readonly userFieldsMap: Record<string, UserField> = {};
	constructor(
		@InjectRepository(UserField)
		private readonly userFieldRepository: Repository<UserField>
	) {}

	async onModuleInit() {
		const userFields = await this.userFieldRepository.find();
		userFields.forEach((field) => {
			this.userFieldsMap[field.id] = field;
		});
	}

	getUserFieldById(id: number) {
		return this.userFieldsMap[id];
	}

}