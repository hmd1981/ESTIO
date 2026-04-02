import type { NavigationItem, NavigationLocation } from '../../../contracts/entities';
import type { CreateNavigationItemDto } from '../dto/create-navigation-item.dto';
import type { UpdateNavigationItemDto } from '../dto/update-navigation-item.dto';

export interface NavigationPort {
  create(dto: CreateNavigationItemDto): Promise<NavigationItem>;
  findByLocation(location: NavigationLocation): Promise<NavigationItem[]>;
  findAllAdmin(): Promise<NavigationItem[]>;
  update(id: string, dto: UpdateNavigationItemDto): Promise<NavigationItem>;
  remove(id: string): Promise<void>;
}
