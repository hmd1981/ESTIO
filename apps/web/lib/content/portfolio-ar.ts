import type {
  PortfolioContentBundle,
  PortfolioProject,
} from "./portfolio-types";

const index = {
  seoTitle: "أعمالنا — منصات ومواقع أنشأناها",
  seoDescription:
    "معرض منصات ومواقع live سلّمها Estio — fintech، أسواق، إعلام، اكتشاف ضيافة، وخدمات موثّقة في عُمان والخليج والأسواق الإقليمية.",
  kicker: "معرض الأعمال",
  h1: "ما أنشأناه",
  lead: "تاريخ حي للمنتجات المُطلَقة — لا mockups. كل مشروع أدناه منصة أو موقع live صمّمه Estio أو يشغّله. لقطات الشاشة تعرض التجربة الحقيقية؛ اتبع الرابط لزيارة الموقع في الإنتاج.",
  competitionLead:
    "يشارك Estio أيضاً في مسابقات إبداعية وتقنية في الخليج. تُعرض مشاركات المسابقات هنا ضمن تاريخ التسليم — ويمكن إضافة عروض جديدة مع كل دورة.",
  categoryLabels: {
    platform: "منصة",
    commerce: "تجارة وقوائم",
    media: "إعلام وتصوير",
    fintech: "تقنية مالية",
    services: "خدمات موثّقة",
    competition: "مسابقات وعروض",
  },
};

export const portfolioProjectsAr: PortfolioProject[] = [
  {
    slug: "estio-tech",
    title: "Estio.tech — مركز خدمات الذكاء والتسويق",
    domain: "estio.tech",
    url: "https://www.estio.tech",
    category: "platform",
    year: "2024",
    description:
      "محور العلامة وخدمات Estio للذكاء والتسويق وإنتاج المحتوى في عُمان — positioning ثنائي اللغة ومسارات leads لعملاء الخليج.",
    deliverables: [
      "هيكلة موقع تسويقي ونظام بصري",
      "هيكل صفحات الخدمات",
      "imagery للـ hero وأقسام جاهزة للحملات",
      "مسارات تواصل واستفسار",
    ],
    tags: ["ويب", "خدمات ذكاء", "عُمان", "تسويق"],
    imageUrl: "https://estio.tech/images/hero/hero-gcc-business.jpg",
    imageAlt: "Estio.tech — خدمات ذكاء وتسويق لأعمال الخليج",
  },
  {
    slug: "estio-ir",
    title: "Estio.ir — استوديو محتوى بالذكاء (إيران)",
    domain: "estio.ir",
    url: "https://www.estio.ir",
    category: "platform",
    year: "2024",
    description:
      "موقع استوديو بالفارسية لإنتاج محتوى بالذكاء — هيكل عروض محلي وإشارات ثقة للسوق الإيراني.",
    deliverables: [
      "تخطيط RTL وأ typography",
      "صفحات خدمات محلية",
      "إطار عروض الاستوديو",
      "مسار استفسار إنتاج",
    ],
    tags: ["ويب", "RTL", "استوديو", "فارسي"],
    imageUrl: "https://estio.ir/images/og-iran.jpg",
    imageAlt: "Estio.ir — استوديو ذكاء للمحتوى",
  },
  {
    slug: "omoney-online",
    title: "اومانی — صراف وحوالة دولية",
    domain: "omoney.online",
    url: "https://www.omoney.online",
    category: "fintech",
    year: "2023",
    description:
      "حضور ويب fintech لخدمات الصراف والحوالة — تواصل واضح للأسعار والخدمات لمستخدمي فارسي/عربي.",
    deliverables: [
      "هيكلة شرح الخدمة",
      "تخطيط يركّز على الثقة والامتثال",
      "مسارات تحويل mobile-first",
      "محتوى ثنائي/RTL",
    ],
    tags: ["Fintech", "صراف", "RTL", "ويب"],
    imageUrl: "/portfolio/omoney-online.png",
    imageAlt: "اومانی omoney.online — صراف وحوالة",
  },
  {
    slug: "mycafes-app",
    title: "MyCafe — مقاهي ومطاعم عُمان",
    domain: "mycafes.app",
    url: "https://www.mycafes.app",
    category: "commerce",
    year: "2023",
    description:
      "منصة اكتشاف مشهد المقاهي والمطاعم في عُمان — تصفح أماكن وفئات ومواقع بتجربة mobile web.",
    deliverables: [
      "UX اكتشاف وتصفح فئات",
      "قوالب قوائم أماكن",
      "IA موجهة للبحث",
      "تخطيط mobile للمستهلك",
    ],
    tags: ["سوق", "ضيافة", "عُمان", "اكتشاف"],
    imageUrl: "/portfolio/mycafes-app.png",
    imageAlt: "MyCafe — اكتشف مقاهي ومطاعم عُمان",
    imageFit: "contain",
  },
  {
    slug: "beenbo-app",
    title: "Beenbo — engagement بشري موثّق",
    domain: "beenbo.app",
    url: "https://www.beenbo.app",
    category: "platform",
    year: "2024",
    description:
      "منصة لـ engagement بشري موثّق — سرد منتج، إطار ثقة، ومسارات تسجيل.",
    deliverables: [
      "موقع تسويق منتج",
      "قيمة التحقق",
      "CTAs تسجيل",
      "هوية وواجهة",
    ],
    tags: ["منصة", "تحقق", "SaaS", "ويب"],
    imageUrl: "/portfolio/beenbo-app.png",
    imageAlt: "Beenbo — engagement موثّق",
  },
  {
    slug: "omansale-online",
    title: "OmanSale — إعلانات مبوبة",
    domain: "omansale.online",
    url: "https://www.omansale.online",
    category: "commerce",
    year: "2022",
    description:
      "منصة إعلانات للسوق العُماني — تصفح بالفئات وتدفقات بائع/مشتري.",
    deliverables: [
      "هيكلة قوائم وفئات",
      "UX بحث/تصفح",
      "قوالب عرض إعلان",
      "تدفقات mobile",
    ],
    tags: ["إعلانات", "عُمان", "سوق", "ويب"],
    imageUrl: "/portfolio/omansale-online.png",
    imageAlt: "OmanSale — إعلانات مبوبة",
  },
  {
    slug: "omanphoto-com",
    title: "Oman Photo — تصوير تحريري وفيلم",
    domain: "omanphoto.com",
    url: "https://www.omanphoto.com",
    category: "media",
    year: "2023",
    description:
      "موقع portfolio لتصوير تحريري وفيلم — معرض، سرد مشاريع، واستفسارات عملاء.",
    deliverables: [
      "تخطيط معرض portfolio",
      "صفحات مشاريع تحريرية",
      "نظام بصري غني بالوسائط",
      "تكامل استفسار",
    ],
    tags: ["تصوير", "إعلام", "Portfolio", "عُمان"],
    imageUrl:
      "https://omanphoto.com/api/media/file/1951d3aa-e901-4afd-b495-be10eabe781e.jpg",
    imageAlt: "Oman Photo — portfolio تصوير",
  },
  {
    slug: "otofix-services",
    title: "Otofix — تاريخ مركبة موثّق",
    domain: "otofix.services",
    url: "https://www.otofix.services",
    category: "services",
    year: "2024",
    description:
      "منصة خدمات تاريخ مركبات موثّق — نسخة product-first وثقة وتحويل للمشترين والبائعين.",
    deliverables: [
      "موقع product خدمة",
      "سرد تحقق وUI ثقة",
      "هيكلة leads",
      "positioning automotive",
    ],
    tags: ["سيارات", "تحقق", "خدمات", "ويب"],
    imageUrl: "/portfolio/otofix-services.png",
    imageAlt: "Otofix — سيارة فاخرة وتطبيق جوال على خلفية مسقط",
  },
  {
    slug: "omanlaw-om",
    title: "Oman Legal Assistant — معلومات قانونية ومراجعة محامٍ",
    domain: "omanlaw.om",
    url: "https://www.omanlaw.om",
    category: "services",
    year: "2025",
    description:
      "منصة معلومات قانونية ثنائية اللغة في عُمان — إرشاد منظّم، مسارات مراجعة محامٍ، وعرض يركّز على الثقة للمقيمين والأعمال.",
    deliverables: [
      "موقع معلومات قانونية EN/AR",
      "تدفقات مراجعة محامٍ واستفسار",
      "UI قانوني وهوية بصرية موثوقة",
      "هيكلة محتوى خاصة بعُمان",
    ],
    tags: ["قانون", "عُمان", "ثنائي اللغة", "ويب"],
    imageUrl: "/portfolio/omanlaw-om.png",
    imageAlt: "Oman Legal Assistant — ميزان العدالة مع شعار عُمان",
    imageFit: "contain",
  },
];

export function getPortfolioContentAr(): PortfolioContentBundle {
  return { index, projects: portfolioProjectsAr };
}
