import { Controller, Get, Param, Post, Body, Patch } from '@nestjs/common';
import { ApplicantQuestionService } from './applicant-questions.service';

@Controller('applicant-questions')
export class ApplicantQuestionController {
  constructor(private readonly aqService: ApplicantQuestionService) {}

  // 1. Get all assigned questions
  @Get('assigned/:applicantId/:attemptId')
  async getAssignedQuestions(
    @Param('applicantId') applicantId: string,
    @Param('attemptId') attemptId: string,
  ) {
    return this.aqService.getAssignedQuestions(applicantId, attemptId);
  }

  // 2. Save or update an answer
  @Post('answer')
  async saveAnswer(
    @Body()
    body: {
      applicantId: string;
      attemptId: string;
      questionId: string;
      selectedOptionId: string;
    },
  ) {
    const { applicantId, attemptId, questionId, selectedOptionId } = body;
    return this.aqService.saveAnswer(
      applicantId,
      attemptId,
      questionId,
      selectedOptionId,
    );
  }

  // 3. Get all answers
  @Get('answers/:applicantId/:attemptId')
  async getAnswers(
    @Param('applicantId') applicantId: string,
    @Param('attemptId') attemptId: string,
  ) {
    return this.aqService.getAnswers(applicantId, attemptId);
  }

  // 4. Get last answered question
  @Get('resume/:applicantId/:attemptId')
  async getLastAnswered(
    @Param('applicantId') applicantId: string,
    @Param('attemptId') attemptId: string,
  ) {
    return this.aqService.resumeTest(applicantId, attemptId);
  }

  // 5. Evaluate test
  @Get('evaluate/:applicantId/:attemptId')
  async evaluate(
    @Param('applicantId') applicantId: string,
    @Param('attemptId') attemptId: string,
  ) {
    return this.aqService.evaluateTest(applicantId, attemptId);
  }
}
