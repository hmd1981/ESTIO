import { mkdirSync, existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ImportMediaUrlDto } from './dto/import-media-url.dto';
import { MediaService } from './media.service';

const uploadDir = () => {
  const dir = join(process.cwd(), 'uploads');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
};

@Controller('admin/media')
@UseGuards(JwtAuthGuard)
export class MediaAdminController {
  constructor(private readonly mediaService: MediaService) {}

  @Get(':id/placements')
  async placements(@Param('id') id: string) {
    await this.mediaService.findOne(id);
    return this.mediaService.listPlacementsForAsset(id);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, uploadDir());
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname) || '';
          cb(null, `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`);
        },
      }),
      limits: { fileSize: 15 * 1024 * 1024 },
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file?.filename) {
      throw new BadRequestException('file is required');
    }
    const base = process.env.PUBLIC_FILE_BASE_URL?.replace(/\/$/, '') ?? '';
    const publicUrl = `${base}/uploads/${file.filename}`;
    return this.mediaService.create({
      fileName: file.filename,
      originalName: file.originalname.slice(0, 500),
      mimeType: file.mimetype.slice(0, 200),
      size: file.size,
      publicUrl,
    });
  }

  /** Download image from a public URL and store it like /upload (persistent volume). */
  @Post('import-url')
  async importUrl(@Body() dto: ImportMediaUrlDto) {
    return this.mediaService.importFromUrl(dto);
  }
}
