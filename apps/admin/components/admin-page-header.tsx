import type { ReactNode } from "react";

type Props = {
  title: string;
  description: string;
  /** Contract the UI will call into — keeps engineering and design aligned. */
  apiReference?: string;
  actions?: ReactNode;
};

export function AdminPageHeader({
  title,
  description,
  apiReference,
  actions,
}: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-[var(--admin-border)] pb-6 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-semibold tracking-tight text-[var(--admin-text)] sm:text-xl">
          {title}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--admin-muted)] sm:leading-relaxed">
          {description}
        </p>
        {apiReference ? (
          <p className="mt-3 font-mono text-xs text-[var(--admin-muted)]">
            <span className="font-sans font-medium text-[var(--admin-text)]">
              API ·{" "}
            </span>
            {apiReference}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
