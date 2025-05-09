import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ExecutionStep } from './execution-step.entity';
import { ExecutionScenario } from './execution-scenario.entity';

@Entity('execution_scenarios_steps')
export class ExecutionScenarionStep {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int', { name: 'order' })
  order: number;

  @Column('varchar', { name: 'execution_step_id' })
  executionStepId: number;

  @Column('varchar', { name: 'execution_scenario_id' })
  executionScenarionId: number;

  // specify the name of the column that will be used to reference the user
  @ManyToOne(() => ExecutionStep, (step) => step.scenarioSteps)
  @JoinColumn({ name: 'execution_step_id' })
  executionStep: ExecutionStep;

  @ManyToOne(() => ExecutionScenario, (scenario) => scenario.scenarioSteps)
  @JoinColumn({ name: 'execution_scenario_id' })
  executionScenario: ExecutionScenario;
}
