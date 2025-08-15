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
import { EvaluationService } from 'src/evaluation/evaluation.service';
import { McqQuestion } from 'src/question-bank/entities/question.entity';

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

    private readonly evaluationService: EvaluationService

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

    // 2. If first time starting the test
    const isFirstStart = !attempt.actual_applicant_answered_at;

    if (isFirstStart) {
      attempt.attempt_count = 1;
      attempt.test_status = 'attending';
      attempt.actual_applicant_answered_at = new Date();
      await this.attemptRepo.save(attempt);
    }

    // 3. Mark test token as used (first-time only)
    const token = await this.tokenRepo
      .createQueryBuilder('token')
      .leftJoin('token.test_attempt', 'test_attempt')
      .where('test_attempt.id = :attemptId', { attemptId })
      .getOne();

    if (token && !token.is_used) {
      token.is_used = true;
      await this.tokenRepo.save(token);
    }

    // 4. Return all assigned questions
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
    const attempt = await this.attemptRepo.findOne({
      where: { id: attemptId },
      relations: [
        'applicant',
        'applicant.experience_level',
        'applicant.primary_skill',
        'applicant.secondary_skill',
      ],
    });

    if (!attempt) {
      throw new NotFoundException('Test attempt not found');
    }

    if (attempt.test_status === 'completed') {
      throw new BadRequestException('Test has already been submitted');
    }

    attempt.attempt_count = attempt.attempt_count ?? 1;
    if (attempt.attempt_count >= 3) {
      throw new BadRequestException('Max resume attempts exceeded');
    }

    attempt.attempt_count += 1;
    attempt.test_status = 'attending';

    if (!attempt.actual_applicant_answered_at) {
      attempt.actual_applicant_answered_at = new Date();
    }

    await this.attemptRepo.save(attempt);

    const applicant = attempt.applicant;

    // Load questions with full relations (important!)
    let applicantQuestions = await this.aqRepo.find({
      where: {
        applicant: { id: applicantId },
        test_attempt: { id: attemptId },
      },
      relations: ['mcq_question', 'mcq_question.options', 'mcq_question.skill'],
      order: { id: 'ASC' },
    });

    const skipped = applicantQuestions.filter((q) => q.status === 'skipped');
    // Replace the first not_visited question during resume (security improvement)
    if (attempt.attempt_count > 1) {
      const firstUnvisited = applicantQuestions.find((q) => q.status === 'not_visited');

      if (firstUnvisited) {
        const { skill, difficulty } = firstUnvisited.mcq_question;
        await this.aqRepo.remove([firstUnvisited]);

        const newQuestion = await this.evaluationService.getOneNewQuestionWithSameDifficulty(
          skill.id,
          difficulty,
          attemptId
        );

        if (newQuestion) {
          const newAQ = this.aqRepo.create({
            applicant: { id: applicantId },
            test_attempt: { id: attemptId },
            mcq_question: newQuestion,
            status: 'not_visited',
          });
          await this.aqRepo.save(newAQ);
        }
      }
    }

    if (skipped.length > 0) {
      // Store info of skipped questions before removing them
      const skippedInfo = skipped.map((q) => ({
        difficulty: q.mcq_question.difficulty as 'easy' | 'medium' | 'hard',
        skillId: q.mcq_question.skill.id,
      }));

      await this.aqRepo.remove(skipped);

      const newQuestions: McqQuestion[] = [];

      for (const { skillId, difficulty } of skippedInfo) {
        const newQ = await this.evaluationService.getOneNewQuestionWithSameDifficulty(
          skillId,
          difficulty,
          attemptId,
        );

        if (newQ) {
          newQuestions.push(newQ);
        }
      }

      const newAq = newQuestions.map((question) =>
        this.aqRepo.create({
          applicant: { id: applicantId },
          test_attempt: { id: attemptId },
          mcq_question: question,
          status: 'not_visited',
        })
      );

      await this.aqRepo.save(newAq);
    }

    // Refresh questions with all relations again
    applicantQuestions = await this.aqRepo.find({
      where: {
        applicant: { id: applicantId },
        test_attempt: { id: attemptId },
      },
      relations: ['mcq_question', 'mcq_question.options'],
    });

    // Sort: answered first, then skipped, then not_visited
    applicantQuestions.sort((a, b) => {
      const order = { answered: 0, skipped: 1, not_visited: 2 };
      return order[a.status] - order[b.status];
    });


    const resumeFrom = applicantQuestions.find(
      (q) => q.status === 'not_visited' || q.status === 'skipped'
    );

    return {
      questions: applicantQuestions.map((q) => ({
        id: q.id,
        status: q.status,
        selectedOptionId: q.selected_option?.id ?? null,
        editable: q.status === 'not_visited' || q.status === 'skipped',
        mcq_question: q.mcq_question,
      })),
      lastSeenQuestion: resumeFrom?.mcq_question ?? null,
      attemptCount: attempt.attempt_count,
    };
  }

  // 3. Save or Update Answer
  async saveAnswer(
    applicantId: string,
    attemptId: string,
    questionId: string,
    selectedOptionId: string,
  ) {
    // Validate option
    const option = await this.optionRepo.findOne({
      where: { id: selectedOptionId },
      relations: ['mcqQuestion'],
    });

    if (!option || option.mcqQuestion.id !== questionId) {
      throw new NotFoundException('Invalid option selected');
    }

    // Get applicant_question entity
    const applicantQuestion = await this.aqRepo.findOne({
      where: {
        applicant: { id: applicantId },
        test_attempt: { id: attemptId },
        mcq_question: { id: questionId },
      },
    });

    if (!applicantQuestion) {
      throw new NotFoundException('Applicant question not found');
    }

    // Prevent resubmitting already answered
    if (applicantQuestion.status === 'answered') {
      throw new BadRequestException('You have already submitted this question');
    }

    // Save the answer
    const answer = this.answerRepo.create({
      applicant: { id: applicantId },
      test_attempt: { id: attemptId },
      mcq_question: { id: questionId },
      selected_option: option,
      answered_at: new Date(),
    });

    await this.answerRepo.save(answer);

    // Update question status to 'answered'
    applicantQuestion.status = 'answered';
    await this.aqRepo.save(applicantQuestion);

    return { message: 'Answer submitted successfully' };
  }

  async skipQuestion(
    applicantId: string,
    attemptId: string,
    questionId: string,
  ) {
    const applicantQuestion = await this.aqRepo.findOne({
      where: {
        applicant: { id: applicantId },
        test_attempt: { id: attemptId },
        mcq_question: { id: questionId },
      },
    });

    if (!applicantQuestion) {
      throw new NotFoundException('Applicant question not found');
    }

    // Prevent skipping already answered
    if (applicantQuestion.status === 'answered') {
      throw new BadRequestException('Cannot skip an already answered question');
    }

    // Update status to skipped
    applicantQuestion.status = 'skipped';
    await this.aqRepo.save(applicantQuestion);

    return { message: 'Question skipped successfully' };
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
