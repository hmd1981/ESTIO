/** Stable ids for homepage sections — must match admin + merge-home keys. */
export const HOME_SECTION_IDS = [
  "hero",
  "guided",
  "trust",
  "services",
  "enterprise",
  "industries",
  "cta",
] as const;

export type HomeSectionId = (typeof HOME_SECTION_IDS)[number];
