/** Sales-infrastructure pull-quote — only renders when copy is non-empty. */
export function SalesMicroLine({ text }: { text: string }) {
  const t = text.trim();
  if (!t) return null;
  return (
    <p className="mt-8 max-w-3xl border-s-2 border-s-[var(--accent)]/45 ps-4 text-sm font-medium leading-relaxed text-[var(--text-body)] sm:text-[0.9375rem]">
      {t}
    </p>
  );
}
