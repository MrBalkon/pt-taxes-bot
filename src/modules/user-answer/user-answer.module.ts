import { Module } from '@nestjs/common';
import { UserAnswerService } from './user-answer.service';
import { FieldModule } from '../field/field.module';
import { UserAnswerSerializer } from './user-answer.serializer';
import { UserAnswerRepository } from 'src/repositories/user-answer.repository';

@Module({
	imports: [FieldModule],
	controllers: [],
	providers: [UserAnswerService, UserAnswerSerializer, UserAnswerRepository],
	exports: [UserAnswerService],
})
export class UserAnswerModule {};