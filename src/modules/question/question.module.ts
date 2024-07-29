import { Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from 'src/entities/question.entity';
import { QuestionRepository } from 'src/repositories/question.repository';
import { UserAnswer } from 'src/entities/user-answer.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Question, UserAnswer])],
	controllers: [QuestionController],
	providers: [QuestionService, QuestionRepository],
	exports: [QuestionService],
})
export class QuestionModule {};