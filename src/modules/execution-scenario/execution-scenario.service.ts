import { Injectable } from '@nestjs/common';
import { ExecutionScenarioTaskRepository } from 'src/repositories/execution-scenario-tasks.repository';
import { ExecutionScenarioRepository } from 'src/repositories/execution-scenario.repository';

@Injectable()
export class ExecutionScenarioService {
  constructor(
    private readonly executionScenarioRepository: ExecutionScenarioRepository,
    private readonly executionScenarioTaskRepository: ExecutionScenarioTaskRepository,
  ) {}

  async getExecutionScenariosByTaskSystemName(taskSystemName: string) {
    return this.executionScenarioRepository.getExecutionScenariosByTaskSystemName(
      taskSystemName,
    );
  }

  async getExecutionMapTreeByTaskSystemName(taskSystemName: string) {
    return this.executionScenarioTaskRepository.getExecutionScenarioTasksByTaskSystemName(
      taskSystemName,
    );
  }
}
