import { BehavioralMediaFrame } from "@/components/enterprise/behavioral-media-frame";
import type { CmsVisual, MediaAssetMap } from "@/lib/cms/types";
import type { MergedEnterpriseLanding } from "@/lib/cms/merge-marketing-page";

type Props = {
  landing: MergedEnterpriseLanding["caseStudies"];
  mediaPlaceholder: string;
  mediaAssets: MediaAssetMap;
  blockClass: string;
};

export function EnterpriseCaseStack({
  landing,
  mediaPlaceholder,
  mediaAssets,
  blockClass,
}: Props) {
  if (!landing.items.length) return null;

  const L = landing.labels;

  return (
    <>
      <div className="max-w-3xl">
        <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--text)] sm:text-3xl">
          {landing.title}
        </h2>
        <p className="mt-6 text-sm leading-[1.75] text-[var(--text-body)] sm:text-base">
          {landing.lead}
        </p>
      </div>

      <ul className="mt-12 grid gap-5 xl:grid-cols-3">
        {landing.items.map((study, i) => (
          <li key={`${study.title}-${i}`} className={`${blockClass} flex flex-col`}>
            {study.kicker ? (
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                {study.kicker}
              </p>
            ) : null}
            <h3 className="font-display mt-4 text-xl font-semibold text-[var(--text)]">
              {study.title}
            </h3>
            {study.visual.imageUrl || study.visual.imageMediaAssetId ? (
              <div className="-mx-6 mt-6 sm:-mx-7">
                <BehavioralMediaFrame
                  aspect="2/1"
                  imageRef={study.visual as CmsVisual}
                  mediaAssets={mediaAssets}
                  placeholderLabel={mediaPlaceholder}
                  sizes="(max-width: 1280px) 100vw, 33vw"
                  className="rounded-none border-x-0 border-t-0 shadow-none"
                />
              </div>
            ) : null}
            {study.body && !study.problem && !study.systemBuilt && !study.outcome && study.metrics.length === 0 ? (
              <div className="mt-8 border-t border-[var(--border)] pt-6">
                <p className="text-sm leading-[1.75] text-[var(--text-body)]">{study.body}</p>
                {study.decisionImpact?.trim() ? (
                  <p className="mt-5 text-sm font-medium leading-[1.65] text-[var(--text)]">
                    <span className="mb-1 block text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                      {L.decisionImpact}
                    </span>
                    {study.decisionImpact}
                  </p>
                ) : null}
              </div>
            ) : (
              <dl className="mt-8 space-y-5 border-t border-[var(--border)] pt-6">
                <div>
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    {L.problem}
                  </dt>
                  <dd className="mt-2 text-sm leading-[1.7] text-[var(--text-body)]">
                    {study.problem}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    {L.systemBuilt}
                  </dt>
                  <dd className="mt-2 text-sm leading-[1.7] text-[var(--text-body)]">
                    {study.systemBuilt}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                    {L.outcome}
                  </dt>
                  <dd className="mt-2 text-sm leading-[1.7] text-[var(--text-body)]">
                    {study.outcome}
                  </dd>
                </div>
                {study.metrics.length > 0 ? (
                  <div>
                    <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                      {L.metrics}
                    </dt>
                    <dd className="mt-2">
                      <ul className="space-y-2 text-sm leading-[1.7] text-[var(--text-body)]">
                        {study.metrics.map((m) => (
                          <li key={m} className="flex gap-2">
                            <span
                              className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]"
                              aria-hidden
                            />
                            <span>{m}</span>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                ) : null}
                {study.decisionImpact?.trim() ? (
                  <div className="border-t border-[var(--border)] pt-5">
                    <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
                      {L.decisionImpact}
                    </dt>
                    <dd className="mt-2 text-sm font-medium leading-[1.65] text-[var(--text)]">
                      {study.decisionImpact}
                    </dd>
                  </div>
                ) : null}
              </dl>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
