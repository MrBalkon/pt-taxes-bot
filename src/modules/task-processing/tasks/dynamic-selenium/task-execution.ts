import {
  ExecutionPath,
  ExecutionStep,
} from 'src/entities/execution-step.entity';
import { ExecutionContext } from './execution-context';
import { ExecutionCommand } from 'src/entities/execution-command.entity';
import { Logger } from '@nestjs/common';

export interface TaskExecutionArgs {
  logger: Logger;
  executionContext: ExecutionContext;
  commands: ExecutionCommand[];
}

export class StepExecutionError extends Error {
  step: ExecutionStep;
  constructor(step: ExecutionStep, message: string) {
    super(message);
    this.step = step;
    this.name = 'StepExecutionError';
  }
}

export class TaskExecution {
  protected executionContext: ExecutionContext;
  protected logger: Logger;
  private commandsMap: Record<string, ExecutionCommand>;

  constructor(args: TaskExecutionArgs) {
    this.executionContext = args.executionContext;
    this.commandsMap = args.commands.reduce((acc, command) => {
      acc[command.id] = command;
      return acc;
    }, {});
    this.logger = args.logger;
  }

  async executeTask(): Promise<void> {
    throw new Error('Not implemented');
  }

  async executeTaskSteps(steps: ExecutionStep[]): Promise<void> {
    for (const step of steps) {
      if (this.executionContext.get(`execution.doSkip`)) {
        continue;
      }
      await this.executeStep(step);
    }
  }

  async executeStep(step: ExecutionStep): Promise<void> {
    try {
      const command = this.getCommand(step.executionCommandId);

      const executionSource = this.getExecutionSource(step, command);
      const executionArguments = this.getExecutionArguments(step);

      const commandMethod = this.getExecutionCommandMethod(command);
      const result = await executionSource[commandMethod](
        ...executionArguments,
      );

      if (step.executionArguments?.resultNamePath) {
        this.executionContext.set(
          step.executionArguments.resultNamePath,
          result,
        );
      }
    } catch (e) {
      throw new StepExecutionError(step, e.message);
    }
  }

  private getCommand(id: number) {
    const command = this.commandsMap[id];

    if (!command) {
      throw new Error(`Command with id ${id} not found`);
    }

    return command;
  }

  private getExecutionCommandMethod(command: ExecutionCommand): string {
    const method = command.method;

    if (!method) {
      throw new Error(`No method found for command ${command.id}`);
    }

    return method;
  }

  private getExecutionSource(
    step: ExecutionStep,
    command: ExecutionCommand,
  ): any {
    if (step.executionArguments?.executionSource) {
      const source = this.executionContext.get(
        step.executionArguments.executionSource,
      );

      if (!source) {
        throw new Error(
          `Execution source ${step.executionArguments.executionSource} not found`,
        );
      }

      return source;
    }

    if (command.executionSource) {
      const source = this.executionContext.get(command.executionSource);

      if (!source) {
        throw new Error(
          `Execution source ${command.executionSource} not found`,
        );
      }

      return source;
    }

    throw new Error('No execution source found');
  }

  private getExecutionArguments(step: ExecutionStep): any[] {
    return step.executionArguments?.methodArgs.map((arg) => {
      let value = arg?.value;
      if (arg.contextValuePath) {
        value = this.executionContext.get(arg.contextValuePath);
      }
      if (arg.executionPath) {
        value = this.applyExecutionPath(arg.executionPath, value);
      }
      return value;
    });
  }

  private applyExecutionPath(executionPath: ExecutionPath[], value: any): any {
    for (const path of executionPath) {
      if (path?.executionMethod) {
        value = this.executionContext
          .get(path.executionSource)
          [path.executionMethod](value);
      }
    }
    return value;
  }
}
