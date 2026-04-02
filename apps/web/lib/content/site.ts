import type { AppLocale } from "@/lib/i18n/config";
import type { FooterColumn, NavItem } from "./types";

export const brand = {
  name: "Estio",
  legalName: "Estio",
  domain: "estio.org",
  tagline:
    "Premium digital services and applied AI from Muscat — helping organisations build presence, grow commercially, and automate with discipline.",
  /** Fallback when CMS has no `footerTextAr` on Arabic routes */
  taglineAr:
    "خدمات رقمية وتطبيقات ذكاء اصطناعي من مسقط — لتعزيز الحضور الرقمي، والنمو التجاري، والتشغيل الأذكى بانضباط.",
} as const;

export const primaryNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Enterprise", href: "/enterprise" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const primaryNavAr: NavItem[] = [
  { label: "الرئيسية", href: "/" },
  { label: "الخدمات", href: "/services" },
  { label: "المؤسسات", href: "/enterprise" },
  { label: "من نحن", href: "/about" },
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
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Services",
    links: [
      {
        label: "Website Design & Development",
        href: "/services/web-design-development",
      },
      {
        label: "Content & Campaign Execution",
        href: "/services/content-campaigns",
      },
      { label: "AI Creative Services", href: "/services/ai-creative" },
      { label: "Enterprise AI & automation", href: "/enterprise" },
    ],
  },
];

export const footerColumnsAr: FooterColumn[] = [
  {
    title: "الشركة",
    links: [
      { label: "من نحن", href: "/about" },
      { label: "اتصل بنا", href: "/contact" },
    ],
  },
  {
    title: "الخدمات",
    links: [
      {
        label: "تصميم وتطوير المواقع",
        href: "/services/web-design-development",
      },
      {
        label: "تنفيذ المحتوى والحملات",
        href: "/services/content-campaigns",
      },
      { label: "خدمات الإبداع بالذكاء الاصطناعي", href: "/services/ai-creative" },
      { label: "الذكاء المؤسسي والأتمتة", href: "/enterprise" },
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
  mapQuery: "Qurum,+Muscat,+Oman",
} as const;
