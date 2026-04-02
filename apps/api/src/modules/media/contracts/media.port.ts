import type { MediaAsset } from '../../../contracts/entities';
import type { CreateMediaAssetDto } from '../dto/create-media-asset.dto';
import type { UpdateMediaAssetDto } from '../dto/update-media-asset.dto';

export interface MediaPort {
  create(dto: CreateMediaAssetDto): Promise<MediaAsset>;
  findAll(): Promise<MediaAsset[]>;
  findOne(id: string): Promise<MediaAsset>;
  update(id: string, dto: UpdateMediaAssetDto): Promise<MediaAsset>;
  remove(id: string): Promise<void>;
}
