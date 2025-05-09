import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Question } from './question.entity';
import { UserField } from './user-field.entity';

export enum FieldConditionOperator {
  EQUAL = '=',
}

@Entity('fields-conditions')
export class FieldCondition {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('integer', { name: 'source_field_id' })
  sourceFieldId: number;

  @Column('varchar', { name: 'condition' })
  condition: FieldConditionOperator;

  @Column('integer', { name: 'compare_field_id', nullable: true })
  compareFieldId: number;

  @Column('varchar', { name: 'compare_value', nullable: true })
  compareValue: string | null;

  @ManyToOne(() => UserField, (field) => field.conditions)
  @JoinColumn({ name: 'source_field_id' })
  sourceField: UserField;

  @ManyToOne(() => UserField, (field) => field.dependantConditions)
  @JoinColumn({ name: 'compare_field_id' })
  compareField: UserField;
}

// 1	4	=	7	yes
// 4	12	=	15	yes
