import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const { name, email, phone, password, status, roleId } = createUserDto;

    const existingUser = await this.userRepo.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('User with this email already exists.');
    }

    // Fetch the role entity
    const role = await this.roleRepo.findOne({ where: { id: roleId } });
    if (!role) {
      throw new BadRequestException('Invalid role ID.');
    }

    // Hash the password - salt number(10)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepo.create({
      name,
      email,
      phone,
      hashedPassword,
      role,
      status,
    });

    const savedUser = await this.userRepo.save(newUser);
    return { name: savedUser.name };
  }

  async getAllUser() {
    const users = await this.userRepo
      .createQueryBuilder('user') // This is your LEFT table
      .leftJoinAndSelect('user.role', 'role') // RIGHT table is 'role'
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.phone',
        'user.status',
        'user.createdAt',
        'role.name',
      ])
      .getMany();

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role.name,
      status: user.status,
      createdAt: user.createdAt,
    }));
  }
}
