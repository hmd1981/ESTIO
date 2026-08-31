import { brand } from "@/lib/content/site";
import { absoluteSiteUrl } from "@/lib/seo/public-routes";
import { JsonLd } from "@/components/seo/json-ld";

type FaqItem = { title: string; body: string };

type Props = {
  items: FaqItem[];
  locale: string;
};

export function FaqPageJsonLd({ items, locale }: Props) {
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
        url: absoluteSiteUrl(`/${locale}/faq`),
        isPartOf: {
          "@type": "WebSite",
          name: brand.name,
          url: absoluteSiteUrl(`/${locale}`),
        },
      }}
    />
  );
}
