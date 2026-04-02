import { Module } from '@nestjs/common';
import { CrmUsersAdminController } from './crm-users.admin.controller';
import { CrmUsersService } from './crm-users.service';

@Module({
  controllers: [CrmUsersAdminController],
  providers: [CrmUsersService],
  exports: [CrmUsersService],
})
export class CrmUsersModule {}

