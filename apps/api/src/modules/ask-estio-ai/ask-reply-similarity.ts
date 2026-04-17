import { createHash } from 'node:crypto';
import type { AskHistoryItemDto } from './dto/ask-history-item.dto';

function tokenSet(text: string): Set<string> {
  const s = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2);
  return new Set(s);
}

/** Jaccard similarity on word sets (length > 2 chars). */
export function assistantRepliesTooSimilar(
  previous: string | undefined,
  next: string,
): boolean {
  if (!previous?.trim() || !next.trim()) return false;
  const a = tokenSet(previous);
  const b = tokenSet(next);
  if (a.size < 4 || b.size < 4) return false;
  let inter = 0;
  for (const w of a) {
    if (b.has(w)) inter++;
  }
  const union = a.size + b.size - inter;
  if (union <= 0) return false;
  const j = inter / union;
  const maxSide = Math.max(a.size, b.size);
  const cover = inter / maxSide;
  return j >= 0.48 && cover >= 0.45;
}

export function lastAssistantContentFromHistory(
  history: AskHistoryItemDto[] | undefined,
): string | undefined {
  if (!history?.length) return undefined;
  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i];
    if (h.role === 'assistant' && h.content?.trim()) return h.content.trim();
  }
  return undefined;
}

export function assistantMessageSignature(text: string | undefined): string {
  if (!text) return '(none)';
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}
