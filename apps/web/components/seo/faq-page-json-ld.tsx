import { brand } from "@/lib/content/site";
import { absoluteSiteUrl } from "@/lib/seo/public-routes";
import { JsonLd } from "@/components/seo/json-ld";

type FaqItem = { title: string; body: string };

type Props = {
  items: FaqItem[];
  locale: string;
  /** Page the FAQ belongs to. Defaults to the standalone FAQ page. */
  path?: string;
};

export function FaqPageJsonLd({ items, locale, path }: Props) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((item) => ({
          "@type": "Question",
          name: item.title,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.body,
          },
        })),
        url: absoluteSiteUrl(path ?? `/${locale}/faq`),
        isPartOf: {
          "@type": "WebSite",
          name: brand.name,
          url: absoluteSiteUrl(`/${locale}`),
        },
      }}
    />
  );
}
