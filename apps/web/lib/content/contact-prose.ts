import type { AppLocale } from "@/lib/i18n/config";

export type ContactProseBlock = {
  title: string;
  paragraphs: string[];
};

export function getContactProse(locale: AppLocale): ContactProseBlock[] {
  if (locale === "ar") {
    return contactProseAr;
  }
  return contactProseEn;
}

const contactProseEn: ContactProseBlock[] = [
  {
    title: "What happens after you enquire",
    paragraphs: [
      "Estio replies within one business day from Muscat (Sunday–Thursday, Gulf time). We ask for enough context to route your request — service line, timeline, and whether you need Arabic, English, or both — so the first conversation is substantive, not a generic discovery call.",
      "Marketing and AI Studio requests typically move to a short alignment call, then a written scope with deliverables, review stages, and file formats. Enterprise automation and private AI programmes start with a bounded assessment before any build commitment.",
    ],
  },
  {
    title: "How to reach us",
    paragraphs: [
      "Use the form for structured intake — it creates a tracked lead in our CRM so nothing is lost in email threads. For urgent seasonal campaign questions, WhatsApp is listed in the sidebar once you have a reference number from the form or an existing engagement.",
      "Our office is in Qurum, Muscat. We work with clients across Oman, the UAE, Saudi Arabia, and the wider GCC — most delivery is remote with structured checkpoints; on-site workshops are scheduled when the SOW requires them.",
    ],
  },
  {
    title: "What to include for a faster quote",
    paragraphs: [
      "For websites: target launch date, page list or sitemap draft, languages, and whether you need CMS training. For AI Studio or creative AI: asset types, channels (web, social, print), and who approves brand on your side.",
      "For enterprise work: systems involved (CRM, ERP, identity provider), data residency constraints, and the single workflow you want piloted first. The more specific your first message, the faster we can say yes, no, or not yet with reasons.",
    ],
  },
];

const contactProseAr: ContactProseBlock[] = [
  {
    title: "ماذا يحدث بعد الاستفسار",
    paragraphs: [
      "يرد فريق Estio خلال يوم عمل واحد من مسقط (الأحد–الخميس، بتوقيت الخليج). نطلب سياقاً كافياً لتوجيه طلبكم — خط الخدمة، الجدول، واللغات — حتى تكون المحادثة الأولى جوهرية.",
      "طلبات التسويق واستوديو الذكاء تنتقل عادة إلى اتصال توضيحي قصير ثم نطاق كتابي. برامج الأتمتة والذكاء المؤسسي تبدأ بتقييم محدود قبل أي التزام بناء.",
    ],
  },
  {
    title: "كيف تتواصلون معنا",
    paragraphs: [
      "النموذج ينشئ lead متتبعاً في CRM. لأسئلة الحملات العاجلة، WhatsApp في الشريط الجانبي بعد رقم مرجعي من النموذج أو engagement قائم.",
      "مكتبنا في Qurum، مسقط. نعمل مع عملاء في عُمان والإمارات والسعودية والخليج — أغلب التسليم عن بُعد مع checkpoints؛ workshops في الموقع حسب SOW.",
    ],
  },
  {
    title: "ما الذي يُسرّع عرض السعر",
    paragraphs: [
      "للمواقع: تاريخ الإطلاق، قائمة صفحات، اللغات، وتدريب CMS. للذكاء الإبداعي: أنواع الأصول والقنوات ومعتمد العلامة لديكم.",
      "للمؤسسات: الأنظمة، residency البيانات، وسير عمل pilot واحد. كلما كان أول رسالة أدق، أسرع نجيب بنعم أو لا أو ليس بعد — بأسباب.",
    ],
  },
];
