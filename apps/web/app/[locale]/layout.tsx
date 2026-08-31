import { notFound } from "next/navigation";
import { DocumentLang } from "@/components/document-lang";
import { OrganizationJsonLd } from "@/components/seo/organization-json-ld";
import { SiteBundleProvider } from "@/components/site-bundle-context";
import { getSiteBundle } from "@/lib/cms/fetch-site";
import { isLocale, locales } from "@/lib/i18n/config";

/** Fallback ISR window; on-demand revalidate tags bust cache on publish. */
export const revalidate = 300;

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const bundle = await getSiteBundle(raw);

  return (
    <>
      <DocumentLang locale={raw} />
      <OrganizationJsonLd locale={raw} />
      <SiteBundleProvider value={bundle}>{children}</SiteBundleProvider>
    </>
  );
}
