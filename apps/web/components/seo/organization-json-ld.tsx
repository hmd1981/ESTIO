import { brand, contactPlacements } from "@/lib/content/site";
import { absoluteSiteUrl } from "@/lib/seo/public-routes";
import { JsonLd } from "@/components/seo/json-ld";

export function OrganizationJsonLd({ locale = "en" }: { locale?: string }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: brand.legalName,
        url: absoluteSiteUrl(`/${locale}`),
        logo: absoluteSiteUrl("/logo/estio.svg"),
        description: brand.tagline,
        email: contactPlacements.email,
        telephone: contactPlacements.phoneDisplay,
        address: {
          "@type": "PostalAddress",
          addressLocality: "Muscat",
          addressRegion: "Muscat Governorate",
          addressCountry: "OM",
        },
        areaServed: ["OM", "AE", "SA", "QA", "BH", "KW"],
        sameAs: [contactPlacements.googleMapsUrl],
      }}
    />
  );
}
