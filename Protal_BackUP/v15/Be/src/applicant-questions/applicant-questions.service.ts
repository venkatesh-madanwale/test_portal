import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicantQuestion } from './entities/applicant_questions.entity';
import { ApplicantAnswer } from 'src/applicants/entities/applicant-answer.entity';
import { Option } from 'src/question-bank/entities/option.entity';
import { TestAttempt } from 'src/evaluation/entities/test-attempt.entity';
import { TestAccessToken } from 'src/evaluation/entities/test-access-token.entity';

@Injectable()
export class ApplicantQuestionService {
  constructor(
    @InjectRepository(ApplicantQuestion)
    private readonly aqRepo: Repository<ApplicantQuestion>,

    @InjectRepository(ApplicantAnswer)
    private readonly answerRepo: Repository<ApplicantAnswer>,

    @InjectRepository(Option)
    private readonly optionRepo: Repository<Option>,

    @InjectRepository(TestAttempt)
    private readonly attemptRepo: Repository<TestAttempt>,

    @InjectRepository(TestAccessToken)
    private readonly tokenRepo: Repository<TestAccessToken>,
  ) { }

  // 1. Start Test 
  async getAssignedQuestions(applicantId: string, attemptId: string) {
    const attempt = await this.attemptRepo.findOne({
      where: { id: attemptId },
    });

    if (!attempt) {
      throw new NotFoundException('Test attempt not found');
    }

    // 1. Reject if test already completed
    if (attempt.test_status === 'completed') {
      throw new BadRequestException('You have already attended the test');
    }

    //  2. If first start, mark attempt as attending
    if (attempt.attempt_count <= 1 && !attempt.actual_applicant_answered_at) {
      attempt.test_status = 'attending';
      attempt.actual_applicant_answered_at = new Date();
      await this.attemptRepo.save(attempt);
    }

    // 3. Mark test token as used
    const token = await this.tokenRepo.findOne({
      where: { test_attempt: { id: attemptId } },
    });

    if (token && !token.is_used) {
      token.is_used = true;
      await this.tokenRepo.save(token);
    }

    //  4. Return all assigned questions
    return this.aqRepo.find({
      where: {
        applicant: { id: applicantId },
        test_attempt: { id: attemptId },
      },
      relations: ['mcq_question', 'mcq_question.options'],
    });
  }


  // 2. Resume Test (resume from last question)
  async resumeTest(applicantId: string, attemptId: string) {
    const attempt = await this.attemptRepo.findOne({ where: { id: attemptId } });

    if (!attempt) {
      throw new NotFoundException('Test attempt not found');
    }

    // Already completed → don't allow resume
    if (attempt.test_status === 'completed') {
      throw new BadRequestException('Test has already been submitted');
    }

    // Only increment if not first time
    if (attempt.attempt_count > 1 && attempt.attempt_count >= 3) {
      throw new BadRequestException('Max resume attempts exceeded');
    }

    // Update status and last access
    attempt.attempt_count += 1;
    attempt.test_status = 'attending';
    attempt.actual_applicant_answered_at = new Date();
    await this.attemptRepo.save(attempt);

    const questions = await this.aqRepo.find({
      where: {
        applicant: { id: applicantId },
        test_attempt: { id: attemptId },
      },
      relations: ['mcq_question', 'mcq_question.options'],
    });

    const last = await this.answerRepo.findOne({
      where: {
        applicant: { id: applicantId },
        test_attempt: { id: attemptId },
      },
      order: { answered_at: 'DESC' },
      relations: ['mcq_question'],
    });

    return {
      questions,
      lastSeenQuestion: last?.mcq_question ?? null,
    };
  }


  // 3. Save or Update Answer
  async saveAnswer(
    applicantId: string,
    attemptId: string,
    questionId: string,
    selectedOptionId: string,
  ) {
    const option = await this.optionRepo.findOne({
      where: { id: selectedOptionId },
      relations: ['mcqQuestion'],
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

  // 4. View Submitted Answers
  async getAnswers(applicantId: string, attemptId: string) {
    return this.answerRepo.find({
      where: {
        applicant: { id: applicantId },
        test_attempt: { id: attemptId },
      },
      relations: ['mcq_question', 'selected_option'],
    });
  }

  // 5. Submit Test (evaluate score)
  async evaluateTest(applicantId: string, attemptId: string) {
    const answers = await this.answerRepo.find({
      where: {
        applicant: { id: applicantId },
        test_attempt: { id: attemptId },
      },
      relations: ['selected_option'],
    });

    const correct = answers.filter((a) => a.selected_option?.isCorrect).length;
    const total = answers.length;
    const wrong = total - correct;
    const percentage =
      total > 0 ? ((correct / total) * 100).toFixed(2) + '%' : '0%';

    await this.attemptRepo.update(
      { id: attemptId },
      {
        mcq_score: correct,
        test_status: 'completed',
        is_submitted: true,
        applicant_completed_at: new Date(),
      },
    );

    const token = await this.tokenRepo.findOne({
      where: { test_attempt: { id: attemptId } }
    });
    if (token) {
      token.is_used = true;
      await this.tokenRepo.save(token);
    }

    return {
      total,
      correct,
      wrong,
      percentage,
    };
  }
}
