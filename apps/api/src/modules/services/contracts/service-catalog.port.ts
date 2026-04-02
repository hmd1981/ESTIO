import type { Service } from '../../../contracts/entities';
import type { CreateServiceDto } from '../dto/create-service.dto';
import type { UpdateServiceDto } from '../dto/update-service.dto';

/**
 * Service catalogue (Prisma model `Service`). HTTP surface is `/services`.
 */
export interface ServiceCatalogPort {
  create(dto: CreateServiceDto): Promise<Service>;
  findAll(): Promise<Service[]>;
  findOneBySlug(slug: string): Promise<Service>;
  update(id: string, dto: UpdateServiceDto): Promise<Service>;
  remove(id: string): Promise<void>;
}
