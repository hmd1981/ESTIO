import { PageStatus } from '@prisma/client';

export class PageResponseDto {
  id!: string;
  slug!: string;
  title!: string;
  metaTitle!: string | null;
  metaDescription!: string | null;
  status!: PageStatus;
  sections!: unknown | null;
  createdAt!: Date;
  updatedAt!: Date;
}
