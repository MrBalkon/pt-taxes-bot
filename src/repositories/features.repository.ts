import { Injectable } from '@nestjs/common';
import { Question } from 'src/entities/question.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FeaturesRepository extends Repository<Question> {}
