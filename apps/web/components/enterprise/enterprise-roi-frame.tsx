import type { MergedEnterpriseLanding } from "@/lib/cms/merge-marketing-page";

type Props = {
  roi: MergedEnterpriseLanding["roi"];
  investmentProfileTitle: string;
  panelClass: string;
  blockClass: string;
};

export function EnterpriseRoiFrame({
  roi,
  investmentProfileTitle,
  panelClass,
  blockClass,
}: Props) {
  const hasFormulaBlock =
    roi.formulaLabel.trim() ||
    roi.formula.trim() ||
    roi.inputsTitle.trim() ||
    roi.inputs.length > 0;
  const hasMetricCards = roi.metrics.length > 0;
  const hasTriple =
    roi.reduced.length > 0 || roi.automated.length > 0 || roi.gained.length > 0;
  const invVars = roi.investmentProfile.variables.filter((v) => v.trim());
  const hasInvestment =
    roi.investmentProfile.scope.trim().length > 0 || invVars.length > 0;

  return (
    <>
      <div className={hasFormulaBlock ? "grid gap-12 lg:grid-cols-12 lg:gap-14" : ""}>
        <div className={hasFormulaBlock ? "lg:col-span-5" : "max-w-3xl"}>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
            {roi.title}
          </h2>
          <p className="mt-6 text-sm leading-[1.75] text-[var(--text-body)] sm:text-base">
            {roi.lead}
          </p>
          {hasFormulaBlock ? (
            <div className={`${panelClass} mt-8 p-6 sm:p-7`}>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                {roi.formulaLabel}
              </p>
              <p className="font-display mt-3 text-lg font-semibold leading-[1.4] text-[var(--text)] sm:text-xl">
                {roi.formula}
              </p>
            </div>
          ) : null}
        </div>
        {hasFormulaBlock ? (
          <div className="lg:col-span-7">
            <div className={`${panelClass} p-6 sm:p-8`}>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                {roi.inputsTitle}
              </p>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {roi.inputs.map((item) => (
                  <li
                    key={item}
                    className="border-s-2 border-s-[var(--accent)]/35 bg-[color-mix(in_srgb,var(--canvas)_90%,transparent)] px-4 py-3 text-sm leading-[1.65] text-[var(--text-body)]"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      {hasMetricCards ? (
        <ul className="mt-10 grid gap-5 lg:grid-cols-3">
          {roi.metrics.map((item, i) => (
            <li key={`${item.metric}-${i}`} className={blockClass}>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                {item.metric}
              </p>
              <p className="font-display mt-3 text-2xl font-semibold text-[var(--text)] sm:text-[2rem]">
                {item.value}
              </p>
              <p className="mt-4 text-sm leading-[1.7] text-[var(--muted)]">{item.body}</p>
            </li>
          ))}
        </ul>
      ) : null}

      {hasTriple ? (
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <div className={blockClass}>
            <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              {roi.reducedTitle}
            </h3>
            <ul className="mt-4 space-y-3 text-sm leading-[1.7] text-[var(--muted)]">
              {roi.reduced.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 bg-[var(--accent)]" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className={blockClass}>
            <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              {roi.automatedTitle}
            </h3>
            <ul className="mt-4 space-y-3 text-sm leading-[1.7] text-[var(--muted)]">
              {roi.automated.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 bg-[var(--accent)]" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className={blockClass}>
            <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
              {roi.gainedTitle}
            </h3>
            <ul className="mt-4 space-y-3 text-sm leading-[1.7] text-[var(--muted)]">
              {roi.gained.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 bg-[var(--accent)]" aria-hidden />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {hasInvestment ? (
        <div className={`${panelClass} mt-12 p-6 sm:p-8`}>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
            {investmentProfileTitle}
          </p>
          {roi.investmentProfile.scope.trim() ? (
            <p className="mt-4 text-sm leading-[1.75] text-[var(--text-body)] sm:text-base">
              {roi.investmentProfile.scope}
            </p>
          ) : null}
          {invVars.length > 0 ? (
            <ul className="mt-6 space-y-3 border-t border-[var(--border)] pt-6 text-sm leading-[1.65] text-[var(--muted)]">
              {invVars.map((line) => (
                <li key={line} className="flex gap-2">
                  <span
                    className="mt-2 h-1 w-1 shrink-0 bg-[var(--accent)]/80"
                    aria-hidden
                  />
                  {line}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      {roi.cards.length > 0 ? (
        <ul className="mt-10 grid gap-5 lg:grid-cols-3">
          {roi.cards.map((card, i) => (
            <li key={`${card.title}-${i}`} className={blockClass}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text)]">
                {card.title}
              </h3>
              <p className="mt-3 text-sm leading-[1.7] text-[var(--muted)]">{card.body}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
