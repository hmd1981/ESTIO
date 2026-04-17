import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/container";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { isLocale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/paths";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return {
    title: raw === "ar" ? "الدفع — Estio" : "Checkout — Estio",
  };
}

function q(
  value: string | string[] | undefined,
): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const t = raw?.trim();
  return t || undefined;
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const sp = (await searchParams) ?? {};
  const intent = q(sp.intent);
  return (
    <MarketingShell>
      <section className="border-b border-[var(--border)] bg-[var(--surface)] py-16 sm:py-20">
        <Container as="div" className="max-w-xl">
          <h1 className="font-display text-2xl font-semibold text-[var(--text)] sm:text-3xl">
            {raw === "ar" ? "الدفع" : "Checkout"}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
            {raw === "ar"
              ? "سيتم تفعيل الدفع الآمن لاحقاً. يمكنكم إكمال الطلب عبر صفحة التواصل."
              : "Secure payment will be enabled in a future release. Continue with contact to confirm scope and invoicing."}
          </p>
          {intent ? (
            <p className="mt-3 text-xs text-[var(--muted)]">
              {raw === "ar" ? "النية:" : "Intent:"}{" "}
              <span className="font-medium text-[var(--text)]">{intent}</span>
            </p>
          ) : null}
          <Link
            href={withLocale("/contact?interest=AI_STUDIO&streamlined=1", raw)}
            className="mt-8 inline-flex rounded-md bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--accent-contrast,#0a0a0a)]"
          >
            {raw === "ar" ? "انتقل إلى التواصل" : "Go to contact"}
          </Link>
        </Container>
      </section>
    </MarketingShell>
  );
}
