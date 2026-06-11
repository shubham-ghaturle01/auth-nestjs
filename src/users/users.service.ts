import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(user: Partial<User>): Promise<User> {
    return this.prisma.user.create({ data: user });
  }

  async update(userId: string, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({ where: { id: userId }, data });
  }
}
