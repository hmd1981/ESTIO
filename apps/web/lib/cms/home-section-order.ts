import { HOME_SECTION_IDS } from "@/lib/cms/home-section-ids";
import type { HomeSectionsCMS } from "@/lib/cms/types";

/** Respects admin order + hidden flags; unknown ids are ignored. */
export function computeHomeSectionOrder(cms: HomeSectionsCMS): string[] {
  const hidden = new Set(cms._meta?.hiddenSections ?? []);
  const custom = cms._meta?.sectionOrder;
  if (!custom?.length) {
    return HOME_SECTION_IDS.filter((id) => !hidden.has(id));
  }
  const allowed = new Set<string>(HOME_SECTION_IDS);
  const primary = custom.filter(
    (id) => allowed.has(id) && !hidden.has(id),
  );
  const rest = HOME_SECTION_IDS.filter(
    (id) => !primary.includes(id) && !hidden.has(id),
  );
  return [...primary, ...rest];
}
