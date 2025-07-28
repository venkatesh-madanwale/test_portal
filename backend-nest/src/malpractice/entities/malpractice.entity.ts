// import { Applicant } from 'src/evaluation/entities/test_attempt.entity';
// import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

// @Entity('malpractice')
// export class Malpractice {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @ManyToOne(() => Applicant)
//   @JoinColumn({ name: 'applicant_id' })
//   applicantId: string;

//   @Column({ name: 'profile_image_url', nullable: true })
//   profileImageUrl: string;

//   @Column({ name: 'alert_message', nullable: true })
//   alertMessage: string;

//   @Column({ name: 'malpractice_image_url', nullable: true })
//   malpracticeImageUrl: string;

//   @Column({ name: 'timestamp', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
//   timestamp: Date;
// }


import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';

@Entity('malpractice')
export class Malpractice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'applicant_id' })
  applicantId: string;

  @Column({ name: 'profile_image_url', nullable: true })
  profileImageUrl: string;

  @Column({ name: 'alert_message', nullable: true })
  alertMessage: string;

  @Column({ name: 'malpractice_image_url', nullable: true })
  malpracticeImageUrl: string;

  @Column({
    name: 'timestamp',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  timestamp: Date;
}
