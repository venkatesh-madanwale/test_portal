import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Malpractice } from './entities/malpractice.entity';
import { Applicant } from 'src/evaluation/entities/applicants.entity';

@Injectable()
export class MalpracticeService {
  constructor(
    @InjectRepository(Malpractice)
    private readonly repo: Repository<Malpractice>,

    @InjectRepository(Applicant)
    private readonly applicantRepo: Repository<Applicant>,
  ) {}

  async registerCandidate(data: {
    applicantId: string;
    profileImageUrl: string;
  }): Promise<Malpractice> {
    const applicant = await this.applicantRepo.findOne({
      where: { id: data.applicantId },
    });

    if (!applicant) {
      throw new BadRequestException('Applicant does not exist');
    }

    const malpractice = this.repo.create({
      applicantId: data.applicantId,
      profileImageUrl: data.profileImageUrl,
    });

    return this.repo.save(malpractice);
  }

  async addAlert(data: {
    applicantId: string;
    alertMessage: string;
    malpracticeImageUrl: string;
  }): Promise<Malpractice> {
    const existing = await this.repo.findOne({
      where: { applicantId: data.applicantId },
      order: { timestamp: 'DESC' },
    });

    if (!existing) {
      throw new NotFoundException('Candidate not found - please register first');
    }

    const alert = this.repo.create({
      applicantId: data.applicantId,
      profileImageUrl: existing.profileImageUrl,
      alertMessage: data.alertMessage,
      malpracticeImageUrl: data.malpracticeImageUrl,
      timestamp: new Date(),
    });

    return this.repo.save(alert);
  }

  async findByApplicantId(applicantId: string): Promise<Malpractice[]> {
    return this.repo.find({
      where: { applicantId },
      order: { timestamp: 'DESC' },
    });
  }
}








// import { BadRequestException, Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Malpractice } from './entities/malpractice.entity';
// import { Applicant } from 'src/evaluation/entities/test_attempt.entity';

// @Injectable()
// export class MalpracticeService {
//   constructor(
//     @InjectRepository(Malpractice)
//     private readonly repo: Repository<Malpractice>,

//     @InjectRepository(Applicant)
//     private readonly applicantRepo: Repository<Applicant>,
//   ) { }

//   async registerCandidate(data: {
//     applicantId: string;
//     profileImageUrl: string;
//   }): Promise<Malpractice> {
//     const existing = await this.applicantRepo.findOne({
//       where: { id: data.applicantId },
//     });

//     if (!existing) {
//       throw new BadRequestException('User is not exists')
//     }

//     const malpracticeRecord = this.repo.create({
//       applicantId: existing.id,
//       profileImageUrl: data.profileImageUrl
//     });

//     return await this.repo.save(malpracticeRecord);
//   }

//   async addAlert(data: {
//     applicantId: string;
//     alertMessage: string;
//     malpracticeImageUrl: string;
//   }): Promise<Malpractice> {
//     // Find the most recent candidate record
//     const candidateRecord = await this.repo.findOne({
//       where: { applicantId: data.applicantId },

//     });

//     if (!candidateRecord) {
//       throw new Error('Candidate not found - register first');
//     }

//     // Create new alert record
//     const alertRecord = this.repo.create({
//       applicantId: data.applicantId,
//       profileImageUrl: candidateRecord.profileImageUrl, // Keep reference to profile
//       alertMessage: data.alertMessage,
//       malpracticeImageUrl: data.malpracticeImageUrl,
//       timestamp: new Date(),
//     });

//     return this.repo.save(alertRecord);
//   }

//   async findByApplicantId(applicantId: string): Promise<Malpractice[]> {
//     return this.repo.find({
//       where: { applicantId },
//       order: { timestamp: 'DESC' },
//     });
//   }
// }
