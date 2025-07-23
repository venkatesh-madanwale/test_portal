import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Applicant } from './entities/test_attempt.entity';
import { Skill } from 'src/skills/entities/skill.entity';
import { McqQuestion } from 'src/question-bank/entities/question.entity';
import { TestAttempt } from './entities/test-attempt.entity';
import { TestAccessToken } from './entities/test-access-token.entity';
import { ApplicantQuestion } from 'src/applicant-questions/entities/applicant_questions.entity';
import { Job } from 'src/jobs/entities/job.entity';
import { MailerService } from 'src/mailer/mailer.service';
import { ExperienceLevel } from './entities/experience_levels.entity';
import { GenerateTestLinkDto } from './dto/link.dto';

@Injectable()
export class EvaluationService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Applicant)
    private applicantRepo: Repository<Applicant>,

    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,

    @InjectRepository(McqQuestion)
    private questionRepo: Repository<McqQuestion>,

    @InjectRepository(TestAttempt)
    private attemptRepo: Repository<TestAttempt>,

    @InjectRepository(TestAccessToken)
    private tokenRepo: Repository<TestAccessToken>,

    @InjectRepository(ApplicantQuestion)
    private applicantQuestionRepo: Repository<ApplicantQuestion>,

    @InjectRepository(Job)
    private jobRepo: Repository<Job>,

    @InjectRepository(ExperienceLevel)
    private expRepo: Repository<ExperienceLevel>,

    private readonly mailService: MailerService,
  ) {}

  async generateLink(dto: GenerateTestLinkDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingAttempts = await this.attemptRepo.count({
        where: { applicant: { email: dto.email } },
      });
      if (existingAttempts >= 3) {
        throw new BadRequestException('Maximum test attempts exceeded (3)');
      }

      const experienceLevel = await this.expRepo.findOne({
        where: { id: dto.experience_level_id },
      });
      if (!experienceLevel) {
        throw new BadRequestException('Invalid experience level');
      }

      const levelKey = experienceLevel.name as
        | 'Fresher'
        | 'Junior'
        | 'Mid'
        | 'Senior';

      const difficultyMatrix = {
        Fresher: { easy: 80, medium: 20, hard: 0 },
        Junior: { easy: 50, medium: 40, hard: 10 },
        Mid: { easy: 40, medium: 40, hard: 20 },
        Senior: { easy: 30, medium: 40, hard: 30 },
      };
      const difficultySplit = difficultyMatrix[levelKey];
      const isFresher = levelKey === 'Fresher';
      const hasSecondary = !!dto.secondary_skill_id;

      let aptitudeSkill: Skill | null = null;
      if (isFresher) {
        aptitudeSkill = await this.skillRepo.findOne({
          where: { name: 'Aptitude' },
        });
        if (!aptitudeSkill) {
          throw new BadRequestException('Aptitude skill not found');
        }
      }

      const shuffleArray = <T>(array: T[]): T[] => {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
      };

      const getDifficultyCounts = (
        total: number,
        split: Record<'easy' | 'medium' | 'hard', number>,
        allowHard: boolean,
      ) => {
        const adjustedSplit = allowHard
          ? split
          : {
              easy:
                split.easy +
                (split.hard / 100) * (split.easy / (split.easy + split.medium)),
              medium:
                split.medium +
                (split.hard / 100) *
                  (split.medium / (split.easy + split.medium)),
              hard: 0,
            };

        const easy = Math.floor((adjustedSplit.easy / 100) * total);
        const medium = Math.floor((adjustedSplit.medium / 100) * total);
        const hard = allowHard ? total - (easy + medium) : 0;

        const sum = easy + medium + hard;
        const diff = total - sum;

        return {
          easy: easy + diff,
          medium,
          hard,
        };
      };

      const fetchQuestionsBySkill = async (
        skillId: string,
        totalCount: number,
        allowHard: boolean,
      ): Promise<McqQuestion[]> => {
        const counts = getDifficultyCounts(
          totalCount,
          difficultySplit,
          allowHard,
        );
        const result: McqQuestion[] = [];

        for (const [difficulty, count] of Object.entries(counts)) {
          if (count <= 0) continue;

          const questions = await this.questionRepo
            .createQueryBuilder('q')
            .where('q.skill.id = :skillId', { skillId })
            .andWhere('q.difficulty = :difficulty', { difficulty })
            .orderBy('RANDOM()')
            .limit(count)
            .getMany();

          result.push(...questions);
        }

        return result;
      };

      const fetchAptitudeQuestions = async (): Promise<McqQuestion[]> => {
        const total = 10;
        const counts = getDifficultyCounts(total, difficultySplit, true);
        const result: McqQuestion[] = [];
        const alreadyFetched = new Set<string>();

        const fetchByDifficulty = async (
          difficulty: string,
          count: number,
        ): Promise<McqQuestion[]> => {
          if (count <= 0) return [];

          const query = this.questionRepo
            .createQueryBuilder('q')
            .where('q.skill.id = :skillId', { skillId: aptitudeSkill!.id })
            .andWhere('q.difficulty = :difficulty', { difficulty });

          if (alreadyFetched.size > 0) {
            query.andWhere('q.id NOT IN (:...ids)', {
              ids: [...alreadyFetched],
            });
          }

          const questions = await query
            .orderBy('RANDOM()')
            .limit(count)
            .getMany();

          questions.forEach((q) => alreadyFetched.add(q.id));
          return questions;
        };

        for (const [difficulty, count] of Object.entries(counts)) {
          const fetched = await fetchByDifficulty(difficulty, count);
          result.push(...fetched);
        }

        if (result.length < total) {
          const remaining = total - result.length;

          const query = this.questionRepo
            .createQueryBuilder('q')
            .where('q.skill.id = :skillId', { skillId: aptitudeSkill!.id });

          if (alreadyFetched.size > 0) {
            query.andWhere('q.id NOT IN (:...ids)', {
              ids: [...alreadyFetched],
            });
          }

          const fallback = await query
            .orderBy('RANDOM()')
            .limit(remaining)
            .getMany();

          fallback.forEach((q) => alreadyFetched.add(q.id));
          result.push(...fallback);
        }

        return result;
      };

      const generateQuestions = async (): Promise<McqQuestion[]> => {
        const result: McqQuestion[] = [];

        if (isFresher) {
          const aptitude = await fetchAptitudeQuestions();
          result.push(...shuffleArray(aptitude));
        }

        const skillQuestionCount = isFresher ? 10 : hasSecondary ? 15 : 30;

        const primaryQ = await fetchQuestionsBySkill(
          dto.primary_skill_id,
          skillQuestionCount,
          false,
        );
        result.push(...shuffleArray(primaryQ));

        if (hasSecondary) {
          const secondaryQ = await fetchQuestionsBySkill(
            dto.secondary_skill_id!,
            skillQuestionCount,
            false,
          );
          result.push(...shuffleArray(secondaryQ));
        }

        return result;
      };

      // Save applicant
      const applicant = this.applicantRepo.create({
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        experience_level: { id: dto.experience_level_id },
        primary_skill: { id: dto.primary_skill_id },
        secondary_skill: hasSecondary
          ? { id: dto.secondary_skill_id }
          : undefined,
      });

      const existingApplicant = await this.applicantRepo.findOne({
        where: { email: dto.email },
      });

      if (existingApplicant) {
        throw new BadRequestException(
          'Applicant with this email already exists',
        );
      }

      const savedApplicant = await queryRunner.manager.save(applicant);

      const savedAttempt = await queryRunner.manager.save(
        this.attemptRepo.create({
          applicant: { id: savedApplicant.id },
          job: { id: dto.job_id },
          ta: { id: dto.ta_id },
          test_status: 'pending',
          schedule_start: new Date(),
          schedule_end: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }),
      );

      const attemptId = savedAttempt.id;

      // Send test token
      const token = uuidv4();
      try {
        await this.mailService.sendToken(
          dto.email,
          token,
          savedApplicant.id,
          attemptId,
        );
      } catch (err) {
        throw new InternalServerErrorException('Email sending failed');
      }
      await queryRunner.manager.save(
        this.tokenRepo.create({
          token,
          test_attempt: savedAttempt,
          is_used: false,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        }),
      );

      const questions = await generateQuestions();

      for (const question of questions) {
        await queryRunner.manager.save(
          this.applicantQuestionRepo.create({
            applicant: savedApplicant,
            test_attempt: savedAttempt,
            mcq_question: question,
          }),
        );
      }

      await queryRunner.commitTransaction();

      return {
        statusCode: 201,
        message: 'Test link sent successfully',
        token,
        questionCount: questions.length,
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
