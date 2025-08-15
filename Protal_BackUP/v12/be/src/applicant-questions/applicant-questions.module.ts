import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicantQuestion } from './entities/applicant_questions.entity';
import { ApplicantQuestionService } from './applicant-questions.service';
import { ApplicantQuestionController } from './applicant-questions.controller';
import { Option } from 'src/question-bank/entities/option.entity';
import { ApplicantAnswer } from 'src/applicants/entities/applicant-answer.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicantQuestion, ApplicantAnswer, Option]),
  ],
  controllers: [ApplicantQuestionController],
  providers: [ApplicantQuestionService],
  exports: [ApplicantQuestionService],
})
export class ApplicantQuestionModule {}
