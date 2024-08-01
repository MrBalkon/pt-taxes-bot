import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserField } from 'src/entities/user-field.entity';
import { UserFieldService } from './user-field.service';
import { UserFieldRepository } from 'src/repositories/user-field.repository';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserField]),
	],
	controllers: [],
	providers: [UserFieldService, UserFieldRepository],
	exports: [UserFieldService],
})
export class UserFieldModule {};