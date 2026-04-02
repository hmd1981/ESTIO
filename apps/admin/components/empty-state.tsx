type Props = {
  title: string;
  body: string;
  className?: string;
};

export function EmptyState({ title, body, className = "" }: Props) {
  return (
    <div
      className={`rounded-md border border-dashed border-[var(--admin-border)] bg-[var(--admin-row-header)] px-5 py-10 text-center ${className}`}
    >
      <p className="text-sm font-medium text-[var(--admin-text)]">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-[var(--admin-muted)]">
        {body}
      </p>
    </div>
  );
}
