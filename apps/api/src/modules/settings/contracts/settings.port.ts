import type { Settings } from '../../../contracts/entities';
import type { UpsertSettingsDto } from '../dto/upsert-settings.dto';

/**
 * Site-wide settings. At most one logical row; `get` may return null before first upsert.
 */
export interface SettingsPort {
  get(): Promise<Settings | null>;
  upsert(dto: UpsertSettingsDto): Promise<Settings>;
}
