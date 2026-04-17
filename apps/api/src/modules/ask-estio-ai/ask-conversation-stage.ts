import type { AskContextDto } from './dto/ask-context.dto';

export type NormalizedConversationStage =
  | 'explore'
  | 'clarify'
  | 'ready'
  | 'action'
  | 'complete';

/** Map persisted / legacy stage strings to the funnel. */
export function normalizeConversationStage(
  raw: string | undefined,
): NormalizedConversationStage {
  const s = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (s === 'intent_set') return 'clarify';
  if (
    s === 'explore' ||
    s === 'clarify' ||
    s === 'ready' ||
    s === 'action' ||
    s === 'complete'
  ) {
    return s;
  }
  return 'explore';
}

export function deriveStageFromSignals(
  prodIntent: boolean,
  useCase: string | undefined,
  platform: string | undefined,
): NormalizedConversationStage {
  if (!prodIntent) return 'explore';
  if (!useCase?.trim() && !platform?.trim()) return 'clarify';
  return 'ready';
}

export function sessionSignalsForConfirmation(
  ctx: AskContextDto | undefined,
  normalizedStage: NormalizedConversationStage,
): { hasProdIntent: boolean; hasFitContext: boolean } {
  const hasProdIntent =
    ctx?.intent === 'images' ||
    ctx?.intent === 'video' ||
    ctx?.intent === 'brand';
  const hasFitContext = Boolean(
    ctx?.useCase?.trim() ||
      ctx?.platform?.trim() ||
      normalizedStage === 'ready' ||
      normalizedStage === 'action',
  );
  return { hasProdIntent, hasFitContext };
}
