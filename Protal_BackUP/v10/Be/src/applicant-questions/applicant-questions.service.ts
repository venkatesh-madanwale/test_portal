import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicantQuestion } from './entities/applicant_questions.entity';
import { ApplicantAnswer } from 'src/applicants/entities/applicant-answer.entity';
import { Option } from 'src/question-bank/entities/option.entity';

@Injectable()
export class ApplicantQuestionService {
  constructor(
    @InjectRepository(ApplicantQuestion)
    private readonly aqRepo: Repository<ApplicantQuestion>,

    @InjectRepository(ApplicantAnswer)
    private readonly answerRepo: Repository<ApplicantAnswer>,

    @InjectRepository(Option)
    private readonly optionRepo: Repository<Option>,
  ) {}

  // 1. Get all assigned questions
  async getAssignedQuestions(applicantId: string, attemptId: string) {
    return this.aqRepo.find({
      where: {
        applicant: { id: applicantId },
        test_attempt: { id: attemptId },
      },
      relations: ['mcq_question', 'mcq_question.options'],
    });
  }

  // 2. Save or update answer
  async saveAnswer(
    applicantId: string,
    attemptId: string,
    questionId: string,
    selectedOptionId: string,
  ) {
    const option = await this.optionRepo.findOne({
      where: { id: selectedOptionId },
      relations: ['question'],
    });

    if (!option || option.mcqQuestion.id !== questionId) {
      throw new NotFoundException('Invalid option selected');
    }

    const existing = await this.answerRepo.findOne({
      where: {
        applicant: { id: applicantId },
        test_attempt: { id: attemptId },
        mcq_question: { id: questionId },
      },
    });

    if (existing) {
      existing.selected_option = option;
      existing.answered_at = new Date();
      await this.answerRepo.save(existing);
      return { message: 'Answer updated successfully' };
    }

    const answer = this.answerRepo.create({
      applicant: { id: applicantId },
      test_attempt: { id: attemptId },
      mcq_question: { id: questionId },
      selected_option: option,
      answered_at: new Date(),
    });

    await this.answerRepo.save(answer);
    return { message: 'Answer saved successfully' };
  }

  // 3. Get all answered questions
  async getAnswers(applicantId: string, attemptId: string) {
    return this.answerRepo.find({
      where: {
        applicant: { id: applicantId },
        test_attempt: { id: attemptId },
      },
      relations: ['mcq_question', 'selected_option'],
    });
  }

  // 4. Resume from last answered question
  async getLastAnsweredQuestion(applicantId: string, attemptId: string) {
    const last = await this.answerRepo.findOne({
      where: {
        applicant: { id: applicantId },
        test_attempt: { id: attemptId },
      },
      order: { answered_at: 'DESC' },
      relations: ['mcq_question'],
    });

    return last?.mcq_question ?? null;
  }

  // 5. Evaluate test
  async evaluateTest(applicantId: string, attemptId: string) {
    const answers = await this.answerRepo.find({
      where: {
        applicant: { id: applicantId },
        test_attempt: { id: attemptId },
      },
      relations: ['selected_option'],
    });

    const total = answers.length;
    const correct = answers.filter((a) => a.selected_option?.isCorrect).length;

    return {
      total,
      correct,
      wrong: total - correct,
      percentage: total > 0 ? ((correct / total) * 100).toFixed(2) + '%' : '0%',
    };
  }
}
