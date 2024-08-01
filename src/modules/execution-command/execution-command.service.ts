import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ExecutionCommand } from 'src/entities/execution-command.entity';
import { ExecutionCommandRepository } from 'src/repositories/task-execution.repository';
import { Repository } from 'typeorm';


// TODO add loading of command to local storagr
@Injectable()
export class ExecutionCommandService{
	constructor(
		private readonly executionCommandRepository: ExecutionCommandRepository
	) {}

	async getExecutionCommandsByTaskSystemName(taskSystemName: string) {
		return this.executionCommandRepository.getExecutionCommandsByTaskSystemName(taskSystemName);
	}
}