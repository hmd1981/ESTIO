/**
 * Frozen contract for AI Studio analytics ingest + admin stats (v1).
 * Bump STUDIO_RAW_EVENT_SCHEMA_VERSION only with a migration + frontend sync plan.
 */
export const STUDIO_RAW_EVENT_SCHEMA_VERSION = 1 as const;

/** Minimum raw events in window before optimization / recommendations are trusted. */
export const STUDIO_MIN_EVENTS_FOR_OPTIMIZATION = 30;

/** Minimum hover-sourced impressions before hover reliability is reported as non-fallback. */
export const STUDIO_MIN_HOVER_IMPRESSIONS = 10;

/** Allowed eventType values for v1 ingest (extend only with schema version bump). */
export const STUDIO_ALLOWED_EVENT_TYPES = [
  'page_view',
  'intent_selected',
  'cta_clicked',
  'exit_input_submitted',
  'scroll_depth',
  'offer_card_view',
] as const;

export type StudioAllowedEventType = (typeof STUDIO_ALLOWED_EVENT_TYPES)[number];

export function isAllowedEventType(t: string): t is StudioAllowedEventType {
  return (STUDIO_ALLOWED_EVENT_TYPES as readonly string[]).includes(t);
}

/** Browser `bufferEvent` uses `studio_*` names; DB + rollups use canonical types. */
export const STUDIO_CLIENT_TO_CANONICAL_EVENT: Record<string, StudioAllowedEventType> = {
  studio_page_view: 'page_view',
  studio_intent_selected: 'intent_selected',
  studio_cta_clicked: 'cta_clicked',
  studio_exit_input_submitted: 'exit_input_submitted',
  studio_scroll_cta_shown: 'scroll_depth',
  studio_hover_intent: 'intent_selected',
  studio_time_nudge_shown: 'offer_card_view',
  studio_exit_intent_triggered: 'exit_input_submitted',
  studio_conflict_detected: 'intent_selected',
  studio_adaptive_default_applied: 'intent_selected',
  studio_funnel: 'page_view',
};

export function canonicalStudioEventType(
  raw: string,
): StudioAllowedEventType | null {
  if (isAllowedEventType(raw)) return raw;
  const mapped = STUDIO_CLIENT_TO_CANONICAL_EVENT[raw];
  return mapped ?? null;
}
