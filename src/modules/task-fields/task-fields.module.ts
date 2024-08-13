import { Module } from '@nestjs/common';
import { TaskFieldsService } from './task-fields.service';
import { TaskField } from 'src/entities/task-field.entity';
import { TaskOutputField } from 'src/entities/task-fields-output.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskFieldRepository } from 'src/repositories/task-field.repository';
import { TaskFieldSerializer } from './task-fields.serializer';
import { FieldModule } from '../field/field.module';

@Module({
  imports: [
    FieldModule,
    TypeOrmModule.forFeature([TaskField, TaskOutputField]),
  ],
  controllers: [],
  providers: [TaskFieldsService, TaskFieldRepository, TaskFieldSerializer],
  exports: [TaskFieldsService],
})
export class TaskFieldsModule {}
