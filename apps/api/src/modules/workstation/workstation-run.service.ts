import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { createHash } from 'node:crypto';

export type WorkstationJobType =
  | 'text_to_image'
  | 'text_to_video'
  | 'text_to_brand'
  | 'brand_visual_system';

/**
 * Executes AI generation for queued jobs (HTTP to WORKSTATION_URL when set).
 * HTTP route POST /worker/run uses {@link runHttpStub} to avoid self-calls when URL points at this API.
 */
@Injectable()
export class WorkstationRunService {
  private readonly logger = new Logger(WorkstationRunService.name);

  constructor(private readonly http: HttpService) {}

  /** BullMQ / ai-jobs processor: remote workstation or local placeholders. */
  async runForJob(
    type: WorkstationJobType,
    input: Record<string, unknown>,
  ): Promise<string[]> {
    const baseUrl = process.env.WORKSTATION_URL?.trim();
    const secret = process.env.WORKSTATION_SECRET?.trim();

    if (baseUrl) {
      const url = `${baseUrl.replace(/\/$/, '')}/worker/run`;
      const headers: Record<string, string> = {};
      if (secret) headers['x-workstation-secret'] = secret;
      try {
        const res = await firstValueFrom(
          this.http.post<{ outputs?: string[] }>(
            url,
            { type, input },
            { timeout: 120_000, headers },
          ),
        );
        const out = res.data?.outputs;
        if (Array.isArray(out) && out.length > 0) return out;
        this.logger.warn('Workstation returned empty outputs; using placeholders');
      } catch (e) {
        this.logger.error(
          `Workstation call failed: ${e instanceof Error ? e.message : e}`,
        );
        throw e;
      }
    }

    return this.placeholderOutputs(type, input);
  }

  /** POST /worker/run on this API — deterministic samples (do not HTTP-loop to self). */
  async runHttpStub(
    type: WorkstationJobType,
    input: Record<string, unknown>,
  ): Promise<string[]> {
    return this.placeholderOutputs(type, input);
  }

  private placeholderOutputs(
    type: WorkstationJobType,
    input: Record<string, unknown>,
  ): string[] {
    const prompt =
      typeof input.prompt === 'string'
        ? input.prompt
        : typeof input.description === 'string'
          ? input.description
          : 'estio-studio';
    const seed = createHash('sha256').update(`${type}:${prompt}`).digest('hex').slice(0, 16);
    const w = type === 'text_to_video' ? 640 : 800;
    const h = type === 'text_to_video' ? 360 : 600;
    const n = 4;
    return Array.from(
      { length: n },
      (_, i) => `https://picsum.photos/seed/${seed}${i}/${w}/${h}`,
    );
  }
}
