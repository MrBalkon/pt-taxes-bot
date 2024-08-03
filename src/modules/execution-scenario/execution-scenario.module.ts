import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Type } from 'class-transformer';
import { ExecutionScenario } from 'src/entities/execution-scenario.entity';
import { ExecutionScenarioRepository } from 'src/repositories/execution-scenario.repository';
import { ExecutionScenarioService } from './execution-scenario.service';
import { ExecutionScenarioTaskRepository } from 'src/repositories/execution-scenario-tasks.repository';
import { ExecutionScenarionTask } from 'src/entities/execution-scenario-task.entity';

@Module({
	imports: [TypeOrmModule.forFeature([ExecutionScenario, ExecutionScenarionTask])],
	controllers: [],
	providers: [ExecutionScenarioService, ExecutionScenarioRepository, ExecutionScenarioTaskRepository],
	exports: [ExecutionScenarioService],
})
export class ExecutionScenarioModule {};