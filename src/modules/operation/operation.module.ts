import { Module } from '@nestjs/common';
import { OperationService } from './operation.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Operation } from 'src/entities/operation.entity';
import { OperationRepository } from 'src/repositories/operation.repository';

@Module({
	imports: [TypeOrmModule.forFeature([Operation])],
	controllers: [],
	providers: [OperationService, OperationRepository],
	exports: [OperationService],
})
export class OperationModule {};