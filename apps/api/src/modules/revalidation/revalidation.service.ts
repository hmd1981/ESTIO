import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RevalidationService {
  private readonly logger = new Logger(RevalidationService.name);

  async revalidateTags(tags: string[]) {
    const base = process.env.WEB_REVALIDATE_URL?.trim();
    const secret = process.env.REVALIDATE_SECRET?.trim();
    if (!base || !secret) {
      // Optional in environments that don't run the web app.
      this.logger.debug(
        'Revalidation skipped (missing WEB_REVALIDATE_URL or REVALIDATE_SECRET).',
      );
      return;
    }
    const url = base.replace(/\/$/, '') + '/api/revalidate';
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, tags }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        this.logger.warn(`Revalidate failed (${res.status}): ${txt}`);
        return;
      }
      this.logger.log(`Revalidated tags: ${tags.join(', ')}`);
    } catch (err) {
      this.logger.warn(`Revalidate error: ${String(err)}`);
    }
  }
}
