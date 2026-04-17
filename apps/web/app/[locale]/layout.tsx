import { notFound } from "next/navigation";
import { DocumentLang } from "@/components/document-lang";
import { SiteBundleProvider } from "@/components/site-bundle-context";
import { getSiteBundle } from "@/lib/cms/fetch-site";
import { isLocale, locales } from "@/lib/i18n/config";

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
      <SiteBundleProvider value={bundle}>{children}</SiteBundleProvider>
    </>
  );
}
