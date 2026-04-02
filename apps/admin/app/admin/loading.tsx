export default function AdminLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy="true" aria-label="Loading">
      <div className="space-y-3 border-b border-[var(--admin-border)] pb-6">
        <div className="h-7 w-48 rounded bg-[var(--admin-skeleton)]" />
        <div className="h-4 max-w-2xl rounded bg-[var(--admin-skeleton-muted)]" />
        <div className="h-4 max-w-xl rounded bg-[var(--admin-skeleton-muted)]" />
        <div className="h-3 w-full max-w-lg rounded bg-[var(--admin-skeleton-muted)]" />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="h-10 w-full max-w-xs rounded bg-[var(--admin-skeleton-muted)]" />
        <div className="h-10 w-28 rounded bg-[var(--admin-skeleton)]" />
      </div>
      <div className="h-64 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-row-header)]" />
    </div>
  );
}
