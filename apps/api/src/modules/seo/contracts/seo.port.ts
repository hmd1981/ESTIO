import type { SeoMetadata } from '../../../contracts/entities';
import type { CreateSeoDto } from '../dto/create-seo.dto';
import type { UpdateSeoDto } from '../dto/update-seo.dto';

export interface SeoPort {
  create(dto: CreateSeoDto): Promise<SeoMetadata>;
  findAll(): Promise<SeoMetadata[]>;
  findByRoute(route: string): Promise<SeoMetadata>;
  update(id: string, dto: UpdateSeoDto): Promise<SeoMetadata>;
  remove(id: string): Promise<void>;
}
