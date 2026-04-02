import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CrmUsersService } from './crm-users.service';
import { CreateCrmUserDto } from './dto/create-crm-user.dto';

@Controller('admin/crm-users')
@UseGuards(JwtAuthGuard)
export class CrmUsersAdminController {
  constructor(private readonly users: CrmUsersService) {}

  @Get()
  list() {
    return this.users.list();
  }

  @Post()
  create(@Body() dto: CreateCrmUserDto) {
    return this.users.create(dto);
  }
}

