import type { Page, SiteLocale } from '../../../contracts/entities';
import type { CreatePageDto } from '../dto/create-page.dto';
import type { UpdatePageDto } from '../dto/update-page.dto';

/**
 * Application boundary for CMS pages. Prisma-backed today; swap implementation
 * without changing controllers by honoring this contract.
 */
export interface PagesPort {
  create(dto: CreatePageDto): Promise<Page>;
  findAll(): Promise<Page[]>;
  /** Resolves by slug + locale or rejects with NotFoundException. */
  findOneBySlug(slug: string, locale?: SiteLocale): Promise<Page>;
  update(id: string, dto: UpdatePageDto): Promise<Page>;
  remove(id: string): Promise<void>;
}
