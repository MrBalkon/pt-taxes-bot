import { Injectable } from '@nestjs/common';
import { ExecutionScenarioRepository } from 'src/repositories/execution-scenario.repository';

@Injectable()
export class ExecutionScenarioService {
	constructor(
		private readonly executionScenarioRepository: ExecutionScenarioRepository
	) {}

	async getExecutionScenariosByTaskSystemName(taskSystemName: string) {
		return this.executionScenarioRepository.getExecutionScenariosByTaskSystemName(taskSystemName);
	}
}