import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserField } from 'src/entities/user-field.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FieldService implements OnModuleInit {
	private readonly userFieldIdsMap: Record<string, UserField> = {};
	private readonly userFieldNamesMap: Record<string, UserField> = {};
	constructor(
		@InjectRepository(UserField)
		private readonly userFieldRepository: Repository<UserField>
	) {}

	async onModuleInit() {
		const userFields = await this.userFieldRepository.find();
		userFields.forEach((field) => {
			this.userFieldIdsMap[field.id] = field;
			this.userFieldNamesMap[field.systemName] = field;
		});
	}

	getUserFieldById(id: number) {
		return this.userFieldIdsMap[id];
	}

	getUserFieldByName(name: string) {
		return this.userFieldNamesMap[name];
	}
}