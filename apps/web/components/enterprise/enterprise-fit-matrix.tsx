import type { EnterpriseFitMerged } from "@/lib/cms/merge-marketing-page";

type Props = {
  fit: EnterpriseFitMerged;
  panelClass: string;
};

export function EnterpriseFitMatrix({ fit, panelClass }: Props) {
  const hasContent =
    fit.title.trim() ||
    fit.lead.trim() ||
    fit.fit.length > 0 ||
    fit.nonFit.length > 0;
  if (!hasContent) return null;

  return (
    <div className="max-w-5xl">
      <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
        {fit.title}
      </h2>
      {fit.lead ? (
        <p className="mt-6 max-w-3xl text-sm leading-[1.75] text-[var(--text-body)] sm:text-base">
          {fit.lead}
        </p>
      ) : null}
      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        <div className={`${panelClass} p-6 sm:p-8`}>
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            {fit.fitTitle}
          </h3>
          <ul className="mt-6 space-y-4">
            {fit.fit.map((line) => (
              <li key={line} className="flex gap-3 text-sm leading-relaxed text-[var(--text-body)]">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                  aria-hidden
                />
                {line}
              </li>
            ))}
          </ul>
        </div>
        <div className={`${panelClass} border-[color-mix(in_srgb,var(--border)_96%,#666_4%)] p-6 sm:p-8`}>
          <h3 className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
            {fit.nonFitTitle}
          </h3>
          <ul className="mt-6 space-y-4">
            {fit.nonFit.map((line) => (
              <li key={line} className="flex gap-3 text-sm leading-relaxed text-[var(--muted)]">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--border)]"
                  aria-hidden
                />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
