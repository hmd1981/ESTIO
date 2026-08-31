import type { ResourceArticle } from "@/lib/content/resources-types";
import type { AppLocale } from "@/lib/i18n/config";
import { brand } from "@/lib/content/site";
import { absoluteSiteUrl } from "@/lib/seo/public-routes";
import { JsonLd } from "@/components/seo/json-ld";

type Props = {
  article: ResourceArticle;
  locale: AppLocale;
};

export function ArticleJsonLd({ article, locale }: Props) {
  const url = absoluteSiteUrl(`/${locale}/resources/${article.slug}`);
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: article.title,
        description: article.description,
        datePublished: article.publishedAt,
        dateModified: article.updatedAt,
        inLanguage: locale === "ar" ? "ar" : "en",
        author: {
          "@type": "Organization",
          name: brand.legalName,
          url: absoluteSiteUrl(`/${locale}`),
        },
        publisher: {
          "@type": "Organization",
          name: brand.legalName,
          logo: {
            "@type": "ImageObject",
            url: absoluteSiteUrl("/logo/estio.svg"),
          },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        url,
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: locale === "ar" ? "الرئيسية" : "Home",
              item: absoluteSiteUrl(`/${locale}`),
            },
            {
              "@type": "ListItem",
              position: 2,
              name: locale === "ar" ? "المقالات" : "Resources",
              item: absoluteSiteUrl(`/${locale}/resources`),
            },
            {
              "@type": "ListItem",
              position: 3,
              name: article.title,
              item: url,
            },
          ],
        },
      }}
    />
  );
}
