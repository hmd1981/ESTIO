import type { AppLocale } from "@/lib/i18n/config";
import type { FooterColumn, NavItem } from "./types";

export const brand = {
  name: "Estio",
  legalName: "Estio",
  domain: "estio.org",
  tagline:
    "Launch-ready AI visuals, bilingual websites, and campaign content for GCC brands — scoped quotes, formatted deliverables, Muscat.",
  /** Fallback when CMS has no `footerTextAr` on Arabic routes */
  taglineAr:
    "مرئيات ومواقع ومحتوى جاهز للإطلاق لعلامات الخليج — مخرجات منسّقة، عروض أسعار واضحة، من مسقط.",
} as const;

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "Resources", href: "/resources" },
  { label: "AI Studio", href: "/ai-studio" },
  { label: "Enterprise", href: "/enterprise" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

export const primaryNavAr: NavItem[] = [
  { label: "الرئيسية", href: "/" },
  { label: "الخدمات", href: "/services" },
  { label: "أعمالنا", href: "/work" },
  { label: "المقالات", href: "/resources" },
  { label: "استوديو الذكاء", href: "/ai-studio" },
  { label: "المؤسسات", href: "/enterprise" },
  { label: "من نحن", href: "/about" },
  { label: "الأسئلة الشائعة", href: "/faq" },
  { label: "اتصل بنا", href: "/contact" },
];

export function fallbackPrimaryNav(locale: AppLocale): NavItem[] {
  return locale === "ar" ? primaryNavAr : primaryNav;
}

export const footerColumns: FooterColumn[] = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Our work", href: "/work" },
      { label: "Resources", href: "/resources" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    title: "Services",
    links: [
      {
        label: "Website Design & Development",
        href: "/services/web-design-development",
      },
      { label: "Our work", href: "/work" },
      {
        label: "Content & Campaign Execution",
        href: "/services/content-campaigns",
      },
      { label: "AI Creative Services", href: "/services/ai-creative" },
      { label: "Enterprise automation & AI", href: "/enterprise" },
    ],
  },
  {
    title: "AI Studio",
    links: [
      { label: "AI Image Production", href: "/ai-studio/image-production" },
      { label: "AI Video Production", href: "/ai-studio/video-production" },
      { label: "Brand AI Packs", href: "/ai-studio/brand-ai-packs" },
    ],
  },
];

export const footerColumnsAr: FooterColumn[] = [
  {
    title: "الشركة",
    links: [
      { label: "من نحن", href: "/about" },
      { label: "أعمالنا", href: "/work" },
      { label: "المقالات", href: "/resources" },
      { label: "الأسئلة الشائعة", href: "/faq" },
      { label: "اتصل بنا", href: "/contact" },
      { label: "الخصوصية", href: "/privacy" },
      { label: "الشروط", href: "/terms" },
    ],
  },
  {
    title: "الخدمات",
    links: [
      {
        label: "تصميم وتطوير المواقع",
        href: "/services/web-design-development",
      },
      { label: "أعمالنا", href: "/work" },
      {
        label: "تنفيذ المحتوى والحملات",
        href: "/services/content-campaigns",
      },
      { label: "خدمات الإبداع بالذكاء الاصطناعي", href: "/services/ai-creative" },
      { label: "أتمتة وذكاء مؤسسي", href: "/enterprise" },
    ],
  },
  {
    title: "استوديو الذكاء",
    links: [
      { label: "إنتاج الصور بالذكاء الاصطناعي", href: "/ai-studio/image-production" },
      { label: "إنتاج الفيديو بالذكاء الاصطناعي", href: "/ai-studio/video-production" },
      { label: "حزم العلامة التجارية", href: "/ai-studio/brand-ai-packs" },
    ],
  },
];

export function fallbackFooterColumns(locale: AppLocale): FooterColumn[] {
  return locale === "ar" ? footerColumnsAr : footerColumns;
}

export const contactPlacements = {
  cityLine: "Qurum, Muscat, Oman",
  phoneDisplay: "+968 9337 6940",
  phoneHref: "tel:+96893376940",
  whatsappHref: "https://wa.me/message/NBV22R27A46TB1",
  email: "info@estio.org",
  emailHref: "mailto:info@estio.org",
  /** Shared EN/AR default; override per locale via Pages → contact → Map link in admin. */
  googleMapsUrl: "https://maps.app.goo.gl/vJckMvewcxNNwfq37",
} as const;
