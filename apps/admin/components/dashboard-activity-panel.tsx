import { EmptyState } from "@/components/empty-state";

/**
 * Honest placeholder for future audit / “last edited” feed — no fabricated numbers.
 */
export function DashboardActivityPanel() {
  return (
    <section
      aria-labelledby="activity-heading"
      className="rounded-md border border-[var(--admin-border)] bg-[var(--admin-surface)] p-6 shadow-sm"
    >
      <h2
        id="activity-heading"
        className="text-xs font-semibold uppercase tracking-wide text-[var(--admin-muted)]"
      >
        Activity
      </h2>
      <div className="mt-4">
        <EmptyState
          title="No activity stream yet"
          body="When auditing is enabled, recent publishes, lead updates, and settings changes will appear here—newest first."
        />
      </div>
    </section>
  );
}
