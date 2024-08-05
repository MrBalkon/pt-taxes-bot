import { Module } from '@nestjs/common';
import { FieldService } from './field.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserField } from 'src/entities/user-field.entity';

@Module({
	imports: [TypeOrmModule.forFeature([UserField])],
	controllers: [],
	providers: [FieldService],
	exports: [FieldService],
})
export class FieldModule {};