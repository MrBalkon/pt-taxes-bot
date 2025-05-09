import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserService } from './user.service';
import { ConfigModule } from '../config/config.module';
import { UserAnswerRepository } from 'src/repositories/user-answer.repository';
import { UserAnswer } from 'src/entities/user-answer.entity';
import { QuestionModule } from '../question/question.module';
import { TaskModule } from '../task/task.module';
import { UserRepository } from 'src/repositories/user.repository';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User, UserAnswer]),
    QuestionModule,
    TaskModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserAnswerRepository, UserRepository],
  exports: [UserService],
})
export class UserModule {}
