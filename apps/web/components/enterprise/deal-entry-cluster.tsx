import { SalesMicroLine } from "@/components/enterprise/sales-micro-line";
import { ButtonLink } from "@/components/ui/button-link";
import type { MergedEnterpriseLanding } from "@/lib/cms/merge-marketing-page";
import type { AppLocale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/paths";

function buildScopedContactHref(
  locale: AppLocale,
  messageTemplate: string,
  interest: string,
) {
  const params = new URLSearchParams({
    highlight: "intro",
    interest,
    source: "INTAKE",
    message: messageTemplate,
  });
  return withLocale(`/contact?${params.toString()}#contact-form`, locale);
}

type PreQualCopy = {
  eyebrow: string;
  mustHaveTitle: string;
  mustHave: string[];
  nextTitle: string;
  next: string[];
};

type CommitmentPanelCopy = {
  title: string;
  body: string;
};

type Props = {
  landing: MergedEnterpriseLanding["dealEntry"];
  contentHeadline: string;
  contentBody: string;
  /** Top eyebrow when using simple CTAs only */
  finalCtaEyebrow: string;
  /** When set, used as the first line for card-based deal entry (qualified intake). */
  scopedEngagementEyebrow?: string;
  qualificationRequiredLabel: string;
  qualificationOptionalLabel: string;
  preQualification: PreQualCopy;
  commitmentPanel: CommitmentPanelCopy;
  dealPathMicro: Record<string, { focus: string; expectation: string }>;
  structuredEngagementLine: string;
  locale: AppLocale;
  blockClass: string;
  panelClass: string;
};

export function DealEntryCluster({
  landing,
  contentHeadline,
  contentBody,
  finalCtaEyebrow,
  scopedEngagementEyebrow,
  qualificationRequiredLabel,
  qualificationOptionalLabel,
  preQualification,
  commitmentPanel,
  dealPathMicro,
  structuredEngagementLine,
  locale,
  blockClass,
  panelClass,
}: Props) {
  const hasCardEntries = landing.items.length > 0;
  const hasSimpleCtas =
    Boolean(landing.primaryCta?.label || landing.primaryCta?.href) ||
    Boolean(landing.secondaryCta?.label || landing.secondaryCta?.href);

  if (!hasCardEntries && !hasSimpleCtas) return null;

  const topEyebrow = hasCardEntries
    ? scopedEngagementEyebrow ?? finalCtaEyebrow
    : finalCtaEyebrow;

  return (
    <div
      className={`${panelClass} border-[color-mix(in_srgb,var(--accent)_22%,var(--border)_78%)] px-8 py-12 sm:px-12 sm:py-16 lg:px-16 lg:py-20`}
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--accent)]">
        {topEyebrow}
      </p>
      {hasCardEntries ? (
        <p className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          {landing.title}
        </p>
      ) : null}
      {hasCardEntries ? (
        <>
          <h2 className="font-display mt-5 max-w-2xl text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
            {contentHeadline}
          </h2>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
            {contentBody}
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-[var(--text-body)] sm:text-base">
            {landing.lead}
          </p>
          <SalesMicroLine text={structuredEngagementLine} />

          <div
            className={`${panelClass} mt-10 border-[color-mix(in_srgb,var(--accent)_18%,var(--border)_82%)] p-6 sm:p-8`}
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
              {preQualification.eyebrow}
            </p>
            <p className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--text)]">
              {preQualification.mustHaveTitle}
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--text-body)]">
              {preQualification.mustHave.map((line) => (
                <li key={line} className="flex gap-3">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                    aria-hidden
                  />
                  {line}
                </li>
              ))}
            </ul>
            <p className="mt-8 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {preQualification.nextTitle}
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--muted)]">
              {preQualification.next.map((line) => (
                <li key={line} className="flex gap-3">
                  <span
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--border)]"
                    aria-hidden
                  />
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`${panelClass} mt-10 border-[color-mix(in_srgb,var(--accent)_14%,var(--border)_86%)] p-6 sm:p-8`}
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              {commitmentPanel.title}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[var(--text-body)] sm:text-base">
              {commitmentPanel.body}
            </p>
          </div>

          <ul className="mt-10 grid gap-5 lg:grid-cols-3">
            {landing.items.map((entry, i) => (
              <li
                key={`${entry.title}-${i}`}
                className={`${blockClass} flex h-full flex-col bg-[color-mix(in_srgb,var(--surface)_94%,#000_6%)]`}
              >
                <h3 className="font-display text-xl font-semibold text-[var(--text)]">
                  {entry.title}
                </h3>
                <p className="mt-4 text-sm leading-[1.7] text-[var(--text-body)]">
                  {entry.body}
                </p>
                <p className="mt-8 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  {landing.checklistLabel}
                </p>
                <ul className="mt-4 space-y-3">
                  {entry.checklist.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-[var(--muted)]">
                      <span
                        className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                        aria-hidden
                      />
                      {item}
                    </li>
                  ))}
                </ul>
                {dealPathMicro[entry.intent] ? (
                  <div className="mt-6 border-t border-[var(--border)] pt-6">
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                      {dealPathMicro[entry.intent].focus}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--text-body)]">
                      {dealPathMicro[entry.intent].expectation}
                    </p>
                  </div>
                ) : null}
                {(entry.qualification.required.length > 0 ||
                  entry.qualification.optional.length > 0) && (
                  <div className="mt-8 border-t border-[var(--border)] pt-6">
                    {entry.qualification.required.length > 0 ? (
                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                          {qualificationRequiredLabel}
                        </p>
                        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--text-body)]">
                          {entry.qualification.required.map((line) => (
                            <li key={line} className="flex gap-2">
                              <span
                                className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]"
                                aria-hidden
                              />
                              {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                    {entry.qualification.optional.length > 0 ? (
                      <div className={entry.qualification.required.length > 0 ? "mt-5" : ""}>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                          {qualificationOptionalLabel}
                        </p>
                        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--muted)]">
                          {entry.qualification.optional.map((line) => (
                            <li key={line} className="flex gap-2">
                              <span
                                className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--border)]"
                                aria-hidden
                              />
                              {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                )}
                <ButtonLink
                  href={buildScopedContactHref(
                    locale,
                    entry.messageTemplate,
                    entry.intent,
                  )}
                  className="mt-8 self-start"
                >
                  {entry.ctaLabel}
                </ButtonLink>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <>
          <h2 className="font-display mt-5 max-w-2xl text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
            {landing.title || contentHeadline}
          </h2>
          <p className="mt-6 max-w-3xl text-sm leading-relaxed text-[var(--text-body)] sm:text-base">
            {landing.body || landing.lead || contentBody}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            {landing.primaryCta ? (
              <ButtonLink href={withLocale(landing.primaryCta.href || "/contact", locale)}>
                {landing.primaryCta.label || landing.primaryCta.href}
              </ButtonLink>
            ) : null}
            {landing.secondaryCta ? (
              <ButtonLink
                href={withLocale(landing.secondaryCta.href || "/enterprise", locale)}
                variant="secondary"
              >
                {landing.secondaryCta.label || landing.secondaryCta.href}
              </ButtonLink>
            ) : null}
          </div>
        </>
      )}
    </div>
  );
}
