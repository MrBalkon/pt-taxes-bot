import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserField } from 'src/entities/user-field.entity';
import { UserFieldService } from './user-field.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserField]),
	],
	controllers: [],
	providers: [UserFieldService],
	exports: [UserFieldService],
})
export class UserFieldModule {};