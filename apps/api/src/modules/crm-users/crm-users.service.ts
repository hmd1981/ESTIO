import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCrmUserDto } from './dto/create-crm-user.dto';

@Injectable()
export class CrmUsersService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.crmUser.findMany({
      orderBy: [{ isActive: 'desc' }, { name: 'asc' }],
      take: 200,
    });
  }

  async create(dto: CreateCrmUserDto) {
    const email = dto.email.trim().toLowerCase();
    const name = dto.name.trim();
    if (!email || !email.includes('@')) {
      throw new BadRequestException('Invalid email');
    }
    if (!name) {
      throw new BadRequestException('Name is required');
    }
    return this.prisma.crmUser.create({
      data: {
        email,
        name,
        isActive: dto.isActive ?? true,
      },
    });
  }
}
