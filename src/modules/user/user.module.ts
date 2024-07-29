import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserService } from './user.service';
import { ConfigModule } from '../config/config.module';
import { UserAnswerRepository } from 'src/repositories/user-answer.repository';
import { UserAnswer } from 'src/entities/user-answer.entity';

@Module({
	imports: [
		ConfigModule,
		TypeOrmModule.forFeature([User, UserAnswer]),
	],
	controllers: [UserController],
	providers: [UserService, UserAnswerRepository],
	exports: [UserService],
})
export class UserModule {};