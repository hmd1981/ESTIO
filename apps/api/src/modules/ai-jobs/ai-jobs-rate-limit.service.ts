import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

const WINDOW_MS = 60 * 60 * 1000;
const MAX_JOBS = 30;

@Injectable()
export class AiJobsRateLimitService {
  private readonly hits = new Map<string, number[]>();

  checkOrThrow(clientKey: string): void {
    const now = Date.now();
    const list = this.hits.get(clientKey) ?? [];
    const fresh = list.filter((t) => now - t < WINDOW_MS);
    if (fresh.length >= MAX_JOBS) {
      throw new HttpException(
        'Too many AI job requests; try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    fresh.push(now);
    this.hits.set(clientKey, fresh);
  }
}
