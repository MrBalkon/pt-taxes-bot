import { Injectable } from '@nestjs/common';
import { UserFieldRepository } from 'src/repositories/user-field.repository';

@Injectable()
export class UserFieldService {
	constructor(
		private readonly userFieldRepository: UserFieldRepository
	) {}

	
}