import { Injectable } from '@nestjs/common';
import { Question } from 'src/entities/question.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class QuestionRepository {
  constructor(
    @InjectRepository(Question)
    private repository: Repository<Question>,
  ) {}

  async getQuestionsByFieldIds(fieldIds: number[]) {
    return this.repository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.field', 'field')
      .leftJoinAndSelect('field.conditions', 'conditions')
      .where('question.fieldId IN (:...fieldIds)', { fieldIds })
      .orderBy('question.rank', 'ASC')
      .getMany();
  }
}
