import { brand, companyProfile, contactPlacements } from "@/lib/content/site";
import { absoluteSiteUrl } from "@/lib/seo/public-routes";
import { JsonLd } from "@/components/seo/json-ld";

export function OrganizationJsonLd({ locale = "en" }: { locale?: string }) {
  const isAr = locale === "ar";

  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        name: isAr ? brand.legalNameAr : brand.legalName,
        alternateName: brand.name,
        url: absoluteSiteUrl(`/${locale}`),
        logo: absoluteSiteUrl("/logo/estio.svg"),
        description: isAr ? brand.taglineAr : brand.tagline,
        email: contactPlacements.email,
        telephone: contactPlacements.phoneDisplay,
        foundingDate: companyProfile.incorporated,
        // Registry identifiers — verifiable against the Oman Business Platform.
        identifier: [
          {
            "@type": "PropertyValue",
            name: "Commercial Registration",
            value: companyProfile.crNumber,
          },
          {
            "@type": "PropertyValue",
            name: "Tax Identification Number",
            value: companyProfile.taxId,
          },
        ],
        taxID: companyProfile.taxId,
        address: {
          "@type": "PostalAddress",
          streetAddress: isAr
            ? "مرتفعات المطار"
            : "Murtafaat Al Matar",
          addressLocality: isAr ? "السيب، مسقط" : "Al Seeb, Muscat",
          addressRegion: isAr ? "محافظة مسقط" : "Muscat Governorate",
          addressCountry: "OM",
        },
        areaServed: ["OM", "AE", "SA", "QA", "BH", "KW"],
        sameAs: [
          contactPlacements.googleMapsUrl,
          ...companyProfile.properties.map((property) => property.href),
        ],
      }}
    />
  );
}
