import type { Lead } from '../../../contracts/entities';
import type { CrmLeadStatus } from '@prisma/client';
import type { CreateLeadPublicDto } from '../dto/create-lead-public.dto';
import type { PatchLeadAdminDto } from '../dto/patch-lead-admin.dto';

export interface CreateLeadResponse {
  ok: true;
  id: string;
  createdAt: string;
}

export interface LeadsPort {
  createPublic(dto: CreateLeadPublicDto): Promise<CreateLeadResponse>;
  findAllAdmin(filter?: {
    status?: CrmLeadStatus;
    stage?: string;
    q?: string;
  }): Promise<Lead[]>;
  findOne(id: string): Promise<Lead>;
  updateAdmin(id: string, dto: PatchLeadAdminDto): Promise<Lead>;
}
