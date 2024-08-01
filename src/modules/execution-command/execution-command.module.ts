import { Module } from '@nestjs/common';
import { ExecutionCommandService } from './execution-command.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExecutionCommand } from 'src/entities/execution-command.entity';
import { ExecutionCommandRepository } from 'src/repositories/task-execution.repository';

@Module({
	imports: [TypeOrmModule.forFeature([ExecutionCommand])],
	controllers: [],
	providers: [ExecutionCommandService, ExecutionCommandRepository],
	exports: [ExecutionCommandService],
})
export class ExecutionCommandModule {};