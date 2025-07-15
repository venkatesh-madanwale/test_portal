import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: false })
  phone: string;

  @Column({ name: 'hashed_password' })
  hashedPassword: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'modified_at' })
  modifiedAt: Date;

  @Column({ name: 'role_id' })
  roleId: string;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
