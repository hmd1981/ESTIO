import { mkdirSync, existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { extname, join, basename } from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { SiteLocale } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MediaPort } from './contracts/media.port';
import { CreateMediaAssetDto } from './dto/create-media-asset.dto';
import type { ImportMediaUrlDto } from './dto/import-media-url.dto';
import { UpdateMediaAssetDto } from './dto/update-media-asset.dto';
import { MediaWorkerService } from './media-worker.service';
import { StatusService } from '../status/status.service';

const IMPORT_MAX_BYTES = 15 * 1024 * 1024;

function uploadDir(): string {
  const dir = join(process.cwd(), 'uploads');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function assertFetchableUrl(raw: string): URL {
  let u: URL;
  try {
    u = new URL(raw.trim());
  } catch {
    throw new BadRequestException('Invalid URL');
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') {
    throw new BadRequestException('Only http(s) URLs are allowed');
  }
  const host = u.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host.endsWith('.localhost')
  ) {
    throw new BadRequestException('That URL is not allowed');
  }
  return u;
}

function extFromMime(mime: string): string {
  const m = mime.split(';')[0]?.trim().toLowerCase() ?? '';
  const map: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/avif': '.avif',
    'image/x-icon': '.ico',
    'image/vnd.microsoft.icon': '.ico',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'video/ogg': '.ogv',
    'video/quicktime': '.mov',
  };
  return map[m] ?? '';
}

/**
 * Media library (Prisma) plus integration with the GPU worker
 * ({@link MediaWorkerService}: POST /generate-image, GET /health), typically via SSH reverse tunnel on the Estio host.
 */
@Injectable()
export class MediaService implements MediaPort {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mediaWorker: MediaWorkerService,
    private readonly status: StatusService,
  ) {}

  /** Forwards the JSON body unchanged after prompt validation (see controller). */
  forwardGenerateImageToWorker(body: Record<string, unknown>): Promise<unknown> {
    if (!this.status.isWorkerOnlineFast()) {
      throw new ServiceUnavailableException({
        code: 'WORKER_OFFLINE',
        message: 'GPU services are temporarily offline. Please try again later.',
        reason: this.status.lastReason() ?? 'unreachable',
      });
    }
    return this.mediaWorker.forwardGenerateImage(body);
  }

  /** Proxies GET {MEDIA_WORKER_URL}/health for ops / monitoring. */
  probeMediaWorkerHealth(): Promise<unknown> {
    return this.mediaWorker.probeWorkerHealth();
  }

  /** Optional debug JSON when MEDIA_WORKER_DEBUG=true. */
  getMediaWorkerDebugSnapshot(): Promise<Record<string, unknown>> {
    return this.mediaWorker.getDebugSnapshot();
  }

  create(dto: CreateMediaAssetDto) {
    return this.prisma.mediaAsset.create({ data: dto });
  }

  /**
   * Download a remote media file and store it under uploads/ (same as file upload).
   * Use this when the browser cannot upload but a public URL is available.
   */
  async importFromUrl(dto: ImportMediaUrlDto) {
    const u = assertFetchableUrl(dto.url);
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 45_000);
    let res: Response;
    try {
      res = await fetch(u.toString(), {
        redirect: 'follow',
        signal: controller.signal,
        headers: { Accept: 'image/*,video/*,*/*' },
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new BadRequestException(`Could not fetch URL: ${msg}`);
    } finally {
      clearTimeout(t);
    }
    if (!res.ok) {
      throw new BadRequestException(`Remote returned ${res.status}`);
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) {
      throw new BadRequestException('Empty response');
    }
    if (buf.length > IMPORT_MAX_BYTES) {
      throw new BadRequestException('File is too large (max 15MB)');
    }
    const headerMime =
      res.headers.get('content-type')?.split(';')[0]?.trim() ?? '';
    let ext =
      extname(u.pathname).toLowerCase() ||
      extFromMime(headerMime) ||
      '.bin';
    if (ext.length > 10) ext = '.bin';
    const fileName = `${Date.now()}-${randomBytes(8).toString('hex')}${ext}`;
    const dir = uploadDir();
    await writeFile(join(dir, fileName), buf);
    const base =
      process.env.PUBLIC_FILE_BASE_URL?.replace(/\/$/, '') ?? '';
    const publicUrl = `${base}/uploads/${fileName}`;
    const mimeType = headerMime || 'application/octet-stream';
    const original =
      (dto.originalName?.trim() || basename(u.pathname) || 'imported').slice(
        0,
        500,
      );
    return this.create({
      fileName,
      originalName: original,
      mimeType: mimeType.slice(0, 200),
      size: buf.length,
      publicUrl,
      altText: dto.altText?.trim() || undefined,
      category: dto.category?.trim() || undefined,
    });
  }

  findAll() {
    return this.prisma.mediaAsset.findMany({
      orderBy: { uploadedAt: 'desc' },
      include: {
        placements: {
          orderBy: [{ pageSlug: 'asc' }, { locale: 'asc' }],
          take: 24,
        },
      },
    });
  }

  /** Scan page JSON for public media URLs and persist placement rows. */
  async syncPlacementsForPage(
    slug: string,
    locale: SiteLocale,
    sections: unknown,
  ) {
    await this.prisma.mediaPlacement.deleteMany({
      where: { pageSlug: slug, locale },
    });
    if (sections === null || sections === undefined) {
      return;
    }
    const assets = await this.prisma.mediaAsset.findMany({
      where: { publicUrl: { not: null } },
      select: { id: true, publicUrl: true, fileName: true },
    });
    const assetIds = new Set<string>(assets.map((a) => a.id));
    const placements: {
      mediaAssetId: string;
      pageSlug: string;
      locale: SiteLocale;
      sectionKey: string;
      fieldKey: string;
    }[] = [];

    const pushPlacement = (parts: string[], mediaAssetId: string) => {
      const parent = parts.slice(0, -1);
      const sectionKey = (parent.length ? parent.join('.') : 'root').slice(
        0,
        160,
      );
      const fieldKey = (parts[parts.length - 1] ?? 'value').slice(0, 160);
      placements.push({
        mediaAssetId,
        pageSlug: slug,
        locale,
        sectionKey,
        fieldKey,
      });
    };

    const consider = (parts: string[], str: string) => {
      const trimmed = str.trim();
      if (!trimmed) return;
      for (const a of assets) {
        if (!a.publicUrl) continue;
        const hit =
          trimmed.includes(a.publicUrl) ||
          (a.fileName.length > 4 && trimmed.includes(a.fileName));
        if (hit) {
          pushPlacement(parts, a.id);
        }
      }
    };

    const walk = (obj: unknown, parts: string[]) => {
      if (typeof obj === 'string') {
        consider(parts, obj);
        return;
      }
      if (Array.isArray(obj)) {
        obj.forEach((item, i) => walk(item, [...parts, String(i)]));
        return;
      }
      if (obj && typeof obj === 'object') {
        // Deterministic mapping: { mediaAssetId: "..." } or keys ending with "MediaAssetId"/"mediaAssetId".
        if ('mediaAssetId' in (obj as Record<string, unknown>)) {
          const v = (obj as Record<string, unknown>).mediaAssetId;
          if (typeof v === 'string' && assetIds.has(v)) {
            pushPlacement([...parts, 'mediaAssetId'], v);
          }
        }
        for (const [k, v] of Object.entries(obj)) {
          if (
            typeof v === 'string' &&
            (k === 'mediaAssetId' || k.endsWith('MediaAssetId'))
          ) {
            if (assetIds.has(v)) {
              pushPlacement([...parts, k], v);
              continue;
            }
          }
          walk(v, [...parts, k]);
        }
      }
    };

    walk(sections, []);

    const dedupe = new Map<string, (typeof placements)[0]>();
    for (const p of placements) {
      const key = `${p.mediaAssetId}|${p.pageSlug}|${p.locale}|${p.sectionKey}|${p.fieldKey}`;
      dedupe.set(key, p);
    }
    if (dedupe.size === 0) {
      return;
    }
    await this.prisma.mediaPlacement.createMany({
      data: [...dedupe.values()],
    });
  }

  listPlacementsForAsset(mediaAssetId: string) {
    return this.prisma.mediaPlacement.findMany({
      where: { mediaAssetId },
      orderBy: [{ pageSlug: 'asc' }, { locale: 'asc' }, { sectionKey: 'asc' }],
    });
  }

  async findOne(id: string) {
    const row = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Media asset not found: ${id}`);
    }
    return row;
  }

  async update(id: string, dto: UpdateMediaAssetDto) {
    try {
      return await this.prisma.mediaAsset.update({
        where: { id },
        data: dto,
      });
    } catch {
      throw new NotFoundException(`Media asset not found: ${id}`);
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.mediaAsset.delete({ where: { id } });
    } catch {
      throw new NotFoundException(`Media asset not found: ${id}`);
    }
  }
}
