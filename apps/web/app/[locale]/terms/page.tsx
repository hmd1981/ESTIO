import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingShell } from "@/components/layout/marketing-shell";
import { LegalDocumentBody } from "@/components/legal/legal-document-body";
import { getLegalDocument } from "@/lib/content/legal";
import { marketingDetailMetadata } from "@/lib/seo/metadata-builders";
import { isLocale } from "@/lib/i18n/config";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const doc = getLegalDocument("terms", raw);
  return marketingDetailMetadata(
    { title: doc.seoTitle, description: doc.seoDescription },
    `/${raw}/terms`,
    { locale: raw },
  );
}

export default async function TermsPage({ params }: Props) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const doc = getLegalDocument("terms", raw);
  return (
    <MarketingShell>
      <LegalDocumentBody document={doc} locale={raw} />
    </MarketingShell>
  );
}
