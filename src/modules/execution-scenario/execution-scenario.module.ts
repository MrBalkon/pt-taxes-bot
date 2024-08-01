import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Type } from 'class-transformer';
import { ExecutionScenario } from 'src/entities/execution-scenario.entity';
import { ExecutionScenarioRepository } from 'src/repositories/execution-scenario.repository';
import { ExecutionScenarioService } from './execution-scenario.service';

@Module({
	imports: [TypeOrmModule.forFeature([ExecutionScenario])],
	controllers: [],
	providers: [ExecutionScenarioService, ExecutionScenarioRepository],
	exports: [ExecutionScenarioService],
})
export class ExecutionScenarioModule {};