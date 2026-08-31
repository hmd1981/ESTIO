import type { AppLocale } from "@/lib/i18n/config";
import { brand, contactPlacements } from "./site";

export type LegalSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type LegalDocument = {
  slug: "privacy" | "terms" | "cookies";
  seoTitle: string;
  seoDescription: string;
  kicker: string;
  h1: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
};

const LAST_UPDATED = "2026-08-24";

const privacyEn: LegalDocument = {
  slug: "privacy",
  seoTitle: "Privacy policy",
  seoDescription:
    "How Estio collects, uses, and shares information on estio.org, including contact forms, cookies, analytics, and Google AdSense.",
  kicker: "Legal",
  h1: "Privacy policy",
  lastUpdated: LAST_UPDATED,
  intro: `This policy describes how ${brand.legalName} (“Estio”, “we”) handles personal information when you visit https://${brand.domain} or contact us. We are based in ${contactPlacements.cityLine}. Questions: ${contactPlacements.email}.`,
  sections: [
    {
      heading: "Who we are",
      paragraphs: [
        `Estio operates a bilingual studio website and related services (including AI Studio tools and enquiry forms) from Muscat, Oman. This policy covers the public website and the information you send us through it. Client project contracts may include a separate data-processing schedule; that schedule controls for paid engagements.`,
      ],
    },
    {
      heading: "Information you give us",
      paragraphs: [
        "When you use the contact or intake forms we collect the fields you submit — typically name, business email, phone, organisation, area of interest, and your message. We use this to reply, to qualify fit, and to keep a record of the enquiry in our CRM. We do not sell this information.",
        "If you email or call us, we keep the correspondence as needed to deliver the conversation and, where a contract follows, to perform it.",
      ],
    },
    {
      heading: "Information collected automatically",
      paragraphs: [
        "Like most websites, our servers and security logs may record technical data such as IP address, browser type, language, referring URL, and timestamps. We use this to operate, secure, and diagnose the site.",
        "A theme preference cookie stores whether you chose light or dark appearance. It is not used for advertising.",
      ],
    },
    {
      heading: "Cookies, advertising, and Google",
      paragraphs: [
        "We use cookies and similar technologies to run the site, remember preferences, measure visits, and — on selected content pages — show advertising.",
        "Third parties, including Google, may place and read cookies on your browser, or use web beacons or IP addresses to collect information as a result of ad serving on this website. Google’s use of advertising cookies enables it and its partners to serve ads based on your visit to this site and/or other sites on the internet.",
        "You can opt out of personalised advertising by visiting Google Ads Settings. To understand how Google uses data when you use our partners’ sites or apps, see How Google uses information from sites or apps that use its services.",
      ],
      bullets: [
        "Google Ads Settings: https://www.google.com/settings/ads",
        "How Google uses data: https://policies.google.com/technologies/partner-sites",
        "Google Privacy Policy: https://policies.google.com/privacy",
      ],
    },
    {
      heading: "Analytics and conversion tags",
      paragraphs: [
        "We use Google tags (including conversion measurement) to understand whether marketing and enquiry paths work. These tags may set cookies or read identifiers as described in Google’s policies. We do not use them to build a dossier of named individuals for sale.",
      ],
    },
    {
      heading: "AI Studio and accounts",
      paragraphs: [
        "If you use AI Studio, we process account, wallet, credit, and generation-job data as needed to provide the tool, prevent abuse, and keep financial records. Prompts and generated media are treated as operational data for the service. We do not use your confidential client corpora to train public models unless a written addendum says so.",
      ],
    },
    {
      heading: "How long we keep information",
      paragraphs: [
        "Enquiry records are kept as long as needed to respond and for legitimate business and legal record-keeping. Server logs are rotated on a shorter operational cycle. You can ask us to update or delete enquiry data that is not required for a live contract or legal hold.",
      ],
    },
    {
      heading: "Sharing",
      paragraphs: [
        "We share information with processors who host email, infrastructure, payments, or advertising measurement — only as needed to run Estio. We may disclose information if required by law in Oman or another applicable jurisdiction, or to protect the site and our users from abuse.",
        "Advertising and analytics partners (including Google) receive the technical signals described above when their tags run. They act under their own policies for that processing.",
      ],
    },
    {
      heading: "Your choices",
      paragraphs: [
        "You can refuse non-essential cookies via your browser controls and, where shown, our cookie notice. You can opt out of personalised Google ads as linked above. You can email us to access or correct the contact information we hold about an enquiry you sent.",
        "The site is intended for business users. We do not knowingly collect information from children.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        `Estio, ${contactPlacements.cityLine}. Email ${contactPlacements.email}. Phone ${contactPlacements.phoneDisplay}.`,
      ],
    },
  ],
};

const termsEn: LegalDocument = {
  slug: "terms",
  seoTitle: "Terms of use",
  seoDescription:
    "Terms for using estio.org, Estio content, AI Studio tools, and enquiries — Estio, Muscat, Oman.",
  kicker: "Legal",
  h1: "Terms of use",
  lastUpdated: LAST_UPDATED,
  intro: `These terms govern your use of https://${brand.domain} and related public pages operated by ${brand.legalName}. Paid project work is governed by the signed proposal or statement of work, which prevails if it conflicts with this page.`,
  sections: [
    {
      heading: "Using the site",
      paragraphs: [
        "You may browse the site and read our guides for your own professional use. You may not scrape the site at a volume that degrades service, attempt to break authentication or payment flows, or misrepresent an affiliation with Estio.",
        "Guides are practical notes from our studio. They are not legal, financial, or medical advice and they are not a warranty that a method will work in your organisation.",
      ],
    },
    {
      heading: "Intellectual property",
      paragraphs: [
        "Site design, copy, and trademarks belong to Estio or their licensors. Client work shown in Our work remains subject to the client’s rights; do not reuse those assets as if they were yours.",
        "You may quote short passages of a guide with attribution and a link. You may not republish an article in full without written permission.",
      ],
    },
    {
      heading: "Enquiries and proposals",
      paragraphs: [
        "Submitting a form is a request for a conversation, not an order. We may decline work as described in our delivery notes. Prices and timelines exist only when written in a proposal you accept.",
      ],
    },
    {
      heading: "AI Studio",
      paragraphs: [
        "Credits, generation jobs, and refunds follow the rules shown in the product and any pack terms at checkout. You are responsible for the prompts you submit and for reviewing outputs before you publish them. Do not submit content you do not have rights to use. We may suspend accounts that abuse infrastructure or other users.",
      ],
    },
    {
      heading: "Liability",
      paragraphs: [
        "The public website is provided as available. To the extent permitted by applicable law, Estio is not liable for indirect or consequential loss arising from use of the public site or reliance on a guide. For paid work, liability is as stated in the contract.",
      ],
    },
    {
      heading: "Governing law",
      paragraphs: [
        "These website terms are governed by the laws of the Sultanate of Oman. Courts in Muscat have jurisdiction, without limiting any mandatory consumer protection that may apply in your country.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [
        `Questions: ${contactPlacements.email}. ${contactPlacements.cityLine}.`,
      ],
    },
  ],
};

const cookiesEn: LegalDocument = {
  slug: "cookies",
  seoTitle: "Cookie policy",
  seoDescription:
    "Cookies and similar technologies on estio.org, including essential preferences, Google tags, and advertising cookies.",
  kicker: "Legal",
  h1: "Cookie policy",
  lastUpdated: LAST_UPDATED,
  intro:
    "This page explains the cookies and similar technologies used on estio.org. It should be read with our Privacy policy.",
  sections: [
    {
      heading: "What cookies we use",
      paragraphs: [
        "Essential: a theme cookie remembers light or dark appearance so the page does not flash the wrong theme. Session or draft cookies may be required for preview or checkout flows.",
        "Analytics and measurement: Google tags may set cookies or use identifiers to measure visits and conversions.",
        "Advertising: on pages where we load Google AdSense, Google and its partners may set advertising cookies to serve and measure ads, including personalised ads where allowed.",
      ],
    },
    {
      heading: "Your choices",
      paragraphs: [
        "You can delete or block cookies in your browser. Blocking essential cookies may break theme persistence or parts of checkout. You can opt out of personalised Google advertising at Google Ads Settings.",
        "Where we show a cookie notice, accepting it records a preference in local storage on your device so we do not repeat the banner every page view. Clearing site data resets that preference.",
      ],
      bullets: [
        "Google Ads Settings: https://www.google.com/settings/ads",
        "How Google uses data: https://policies.google.com/technologies/partner-sites",
      ],
    },
    {
      heading: "Updates",
      paragraphs: [
        `We update this page when our use of cookies changes. Last updated ${LAST_UPDATED}. Contact ${contactPlacements.email} if you have questions.`,
      ],
    },
  ],
};

const privacyAr: LegalDocument = {
  slug: "privacy",
  seoTitle: "سياسة الخصوصية",
  seoDescription:
    "كيف تجمع إستيو المعلومات على estio.org وتستخدمها وتشاركها، بما في ذلك نماذج الاتصال والكوكيز والتحليلات وإعلانات جوجل.",
  kicker: "قانوني",
  h1: "سياسة الخصوصية",
  lastUpdated: LAST_UPDATED,
  intro: `تصف هذه السياسة كيف تتعامل ${brand.legalName} («إستيو») مع المعلومات الشخصية عند زيارة https://${brand.domain} أو التواصل معنا. مقرنا في ${contactPlacements.cityLine}. للاستفسار: ${contactPlacements.email}.`,
  sections: [
    {
      heading: "من نحن",
      paragraphs: [
        "تشغّل إستيو موقعاً ثنائي اللغة للاستوديو وخدمات مرتبطة (بما في ذلك أدوات استوديو الذكاء ونماذج الاستفسار) من مسقط، عُمان. تغطي هذه السياسة الموقع العام والمعلومات التي ترسلونها عبره. قد تتضمن عقود المشاريع جدولاً منفصلاً لمعالجة البيانات؛ وهو الذي يسود في التعاقدات المدفوعة.",
      ],
    },
    {
      heading: "معلومات تقدّمونها",
      paragraphs: [
        "عند استخدام نماذج الاتصال أو التأهيل نجمع الحقول التي ترسلونها — عادة الاسم والبريد المهني والهاتف والجهة ومجال الاهتمام والرسالة. نستخدمها للرد ولتقييم الملاءمة ولحفظ سجل الاستفسار في نظام المتابعة. لا نبيع هذه المعلومات.",
        "إذا راسلتمونا أو اتصلتم نحتفظ بالمراسلة بقدر ما يلزم لإتمام المحادثة وأداء العقد إن وُجد.",
      ],
    },
    {
      heading: "معلومات تُجمع تلقائياً",
      paragraphs: [
        "قد تسجّل الخوادم وسجلات الأمن بيانات تقنية مثل عنوان الإنترنت ونوع المتصفح واللغة والمرجع الزمني. نستخدمها لتشغيل الموقع وتأمينه وتشخيص الأعطال.",
        "كوكيز المظهر يحفظ اختيار الوضع الفاتح أو الداكن. لا يُستخدم للإعلان.",
      ],
    },
    {
      heading: "الكوكيز والإعلان وجوجل",
      paragraphs: [
        "نستخدم الكوكيز وتقنيات مشابهة لتشغيل الموقع وتذكّر التفضيلات وقياس الزيارات — وعلى صفحات محتوى مختارة — لعرض الإعلانات.",
        "قد تضع أطراف ثالثة، بما فيها جوجل، كوكيز على متصفحكم أو تقرأها، أو تستخدم إشارات ويب أو عناوين إنترنت لجمع معلومات نتيجة عرض الإعلانات على هذا الموقع. يتيح استخدام جوجل لكوكيز الإعلان لها ولشركائها عرض إعلانات بناءً على زيارتكم لهذا الموقع و/أو مواقع أخرى.",
        "يمكنكم إيقاف الإعلانات المخصّصة من إعدادات إعلانات جوجل. لفهم كيف تستخدم جوجل البيانات عند استخدام مواقع أو تطبيقات شركائها، راجعوا «كيف تستخدم جوجل المعلومات من المواقع أو التطبيقات التي تستخدم خدماتها».",
      ],
      bullets: [
        "إعدادات إعلانات جوجل: https://www.google.com/settings/ads",
        "كيف تستخدم جوجل البيانات: https://policies.google.com/technologies/partner-sites",
        "سياسة خصوصية جوجل: https://policies.google.com/privacy",
      ],
    },
    {
      heading: "التحليلات ووسوم التحويل",
      paragraphs: [
        "نستخدم وسوم جوجل (بما في ذلك قياس التحويل) لفهم إن كانت مسارات التسويق والاستفسار تعمل. قد تضع هذه الوسوم كوكيز أو تقرأ معرّفات وفق سياسات جوجل. لا نستخدمها لبناء ملف أفراد مسمّين للبيع.",
      ],
    },
    {
      heading: "استوديو الذكاء والحسابات",
      paragraphs: [
        "إذا استخدمتم الاستوديو نعالج بيانات الحساب والمحفظة والرصيد ومهام التوليد بقدر ما يلزم لتقديم الأداة ومنع الإساءة وحفظ السجلات المالية. الأوامر والوسائط المولَّدة بيانات تشغيل للخدمة. لا نستخدم مجموعات عملائكم السرية لتدريب نماذج عامة ما لم يقل ملحق مكتوب ذلك.",
      ],
    },
    {
      heading: "مدة الاحتفاظ",
      paragraphs: [
        "تُحفظ سجلات الاستفسار بقدر ما يلزم للرد وللسجلات التجارية والقانونية المشروعة. تُدوَّر سجلات الخادم على دورة تشغيل أقصر. يمكنكم طلب تحديث أو حذف بيانات استفسار غير لازمة لعقد قائم أو حفظ قانوني.",
      ],
    },
    {
      heading: "المشاركة",
      paragraphs: [
        "نشارك المعلومات مع معالجين يستضيفون البريد أو البنية أو الدفع أو قياس الإعلان — فقط بقدر تشغيل إستيو. قد نفصح إن ألزم القانون في عُمان أو ولاية أخرى منطبقة، أو لحماية الموقع ومستخدميه من الإساءة.",
        "يتلقى شركاء الإعلان والتحليلات (بما فيهم جوجل) الإشارات التقنية أعلاه عندما تعمل وسومهم. يتصرفون وفق سياساتهم لتلك المعالجة.",
      ],
    },
    {
      heading: "خياراتكم",
      paragraphs: [
        "يمكنكم رفض الكوكيز غير الأساسية من المتصفح، وحيث يظهر إشعار الكوكيز لدينا. يمكنكم إيقاف إعلانات جوجل المخصّصة عبر الرابط أعلاه. يمكنكم مراسلتنا للوصول إلى معلومات الاتصال التي نحتفظ بها عن استفسار أرسلتموه أو تصحيحها.",
        "الموقع موجّه لمستخدمي الأعمال. لا نجمع عن علم معلومات من الأطفال.",
      ],
    },
    {
      heading: "الاتصال",
      paragraphs: [
        `إستيو، ${contactPlacements.cityLine}. البريد ${contactPlacements.email}. الهاتف ${contactPlacements.phoneDisplay}.`,
      ],
    },
  ],
};

const termsAr: LegalDocument = {
  slug: "terms",
  seoTitle: "شروط الاستخدام",
  seoDescription:
    "شروط استخدام estio.org ومحتوى إستيو وأدوات الاستوديو والاستفسارات — مسقط، عُمان.",
  kicker: "قانوني",
  h1: "شروط الاستخدام",
  lastUpdated: LAST_UPDATED,
  intro: `تحكم هذه الشروط استخدامكم لـ https://${brand.domain} والصفحات العامة التي تشغّلها ${brand.legalName}. العمل المدفوع يحكمه العرض أو نطاق العمل الموقع، وهو الذي يسود إن تعارض مع هذه الصفحة.`,
  sections: [
    {
      heading: "استخدام الموقع",
      paragraphs: [
        "يجوز تصفح الموقع وقراءة الأدلة لاستخدامكم المهني. لا يجوز كشط الموقع بحجم يضر الخدمة، أو محاولة كسر مسارات الدخول أو الدفع، أو ادّعاء انتماء لإستيو.",
        "الأدلة ملاحظات عملية من الاستوديو. ليست استشارة قانونية أو مالية أو طبية وليست ضماناً بأن منهجاً سينجح في منظمتكم.",
      ],
    },
    {
      heading: "الملكية الفكرية",
      paragraphs: [
        "تصميم الموقع والنصوص والعلامات تخص إستيو أو مرخّصيها. أعمال العملاء في «أعمالنا» تبقى خاضعة لحقوق العميل؛ لا تعيدوا استخدامها وكأنها لكم.",
        "يجوز اقتباس فقرات قصيرة من دليل مع نسب ورابط. لا يجوز إعادة نشر مقال كامل دون إذن مكتوب.",
      ],
    },
    {
      heading: "الاستفسارات والعروض",
      paragraphs: [
        "إرسال النموذج طلب محادثة لا أمر شراء. قد نرفض عملاً كما في ملاحظات التسليم. الأسعار والجداول توجد فقط عندما تُكتب في عرض تقبلونه.",
      ],
    },
    {
      heading: "استوديو الذكاء",
      paragraphs: [
        "الأرصدة ومهام التوليد والاسترداد تتبع القواعد الظاهرة في المنتج وشروط الحزم عند الدفع. أنتم مسؤولون عن الأوامر التي ترسلونها وعن مراجعة المخرجات قبل النشر. لا ترسلوا محتوى لا تملكون حق استخدامه. قد نعلّق حسابات تسيء للبنية أو للمستخدمين.",
      ],
    },
    {
      heading: "المسؤولية",
      paragraphs: [
        "الموقع العام يُقدَّم كما هو متاح. في حدود القانون المنطبق لا تُسأل إستيو عن خسارة غير مباشرة من استخدام الموقع العام أو الاعتماد على دليل. للعمل المدفوع المسؤولية كما في العقد.",
      ],
    },
    {
      heading: "القانون الحاكم",
      paragraphs: [
        "تحكم قوانين سلطنة عُمان شروط الموقع هذه. لمحاكم مسقط الاختصاص، دون الإخلال بأي حماية إلزامية للمستهلك قد تنطبق في بلدكم.",
      ],
    },
    {
      heading: "الاتصال",
      paragraphs: [
        `للأسئلة: ${contactPlacements.email}. ${contactPlacements.cityLine}.`,
      ],
    },
  ],
};

const cookiesAr: LegalDocument = {
  slug: "cookies",
  seoTitle: "سياسة ملفات الارتباط",
  seoDescription:
    "الكوكيز والتقنيات المشابهة على estio.org، بما في ذلك التفضيلات الأساسية ووسوم جوجل وكوكيز الإعلان.",
  kicker: "قانوني",
  h1: "سياسة ملفات الارتباط",
  lastUpdated: LAST_UPDATED,
  intro: "تشرح هذه الصفحة الكوكيز والتقنيات المشابهة على estio.org. تُقرأ مع سياسة الخصوصية.",
  sections: [
    {
      heading: "ما الكوكيز التي نستخدمها",
      paragraphs: [
        "أساسية: كوكيز المظهر يتذكر الوضع الفاتح أو الداكن حتى لا يومض الصفحة بالمظهر الخطأ. قد تُلزم كوكيز الجلسة أو المعاينة مسارات المعاينة أو الدفع.",
        "تحليل وقياس: قد تضع وسوم جوجل كوكيز أو تستخدم معرّفات لقياس الزيارات والتحويلات.",
        "إعلان: في الصفحات التي نحمّل فيها AdSense قد تضع جوجل وشركاؤها كوكيز إعلان لعرض الإعلانات وقياسها، بما في ذلك الإعلانات المخصّصة حيث يُسمح.",
      ],
    },
    {
      heading: "خياراتكم",
      paragraphs: [
        "يمكنكم حذف الكوكيز أو حظرها من المتصفح. حظر الأساسية قد يكسر ثبات المظهر أو أجزاء من الدفع. يمكن إيقاف إعلانات جوجل المخصّصة من إعدادات الإعلانات.",
        "حيث نظهر إشعار كوكيز، يسجّل القبول تفضيلاً في التخزين المحلي حتى لا يتكرر الشريط في كل مشاهدة. مسح بيانات الموقع يعيد التفضيل.",
      ],
      bullets: [
        "إعدادات إعلانات جوجل: https://www.google.com/settings/ads",
        "كيف تستخدم جوجل البيانات: https://policies.google.com/technologies/partner-sites",
      ],
    },
    {
      heading: "التحديثات",
      paragraphs: [
        `نحدّث هذه الصفحة عندما يتغير استخدامنا للكوكيز. آخر تحديث ${LAST_UPDATED}. للاستفسار ${contactPlacements.email}.`,
      ],
    },
  ],
};

export function getLegalDocument(
  slug: LegalDocument["slug"],
  locale: AppLocale,
): LegalDocument {
  const map =
    locale === "ar"
      ? { privacy: privacyAr, terms: termsAr, cookies: cookiesAr }
      : { privacy: privacyEn, terms: termsEn, cookies: cookiesEn };
  return map[slug];
}

export const legalNav = {
  en: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/cookies", label: "Cookies" },
  ],
  ar: [
    { href: "/privacy", label: "الخصوصية" },
    { href: "/terms", label: "الشروط" },
    { href: "/cookies", label: "ملفات الارتباط" },
  ],
} as const;
