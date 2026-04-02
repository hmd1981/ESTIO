import type { IndustryItem, ServiceCard } from "./types";

/** Arabic-first defaults when CMS omits home `sections` (GCC / Oman executive tone). */

export const homeHeroAr = {
  headline: "حضور رقمي موثوق، وتشغيل أذكى يلائم مؤسستكم.",
  subheadline:
    "من مسقط: منصّات وهوية رقمية رصينة، وحملات بمؤشرات، وأنظمة ذكاء مربوطة ببياناتكم وسياساتكم — تسليم موثّق ومساءلة مباشرة، وجاهز للعرض على الإدارة.",
  primaryCta: { label: "حدّدوا المطلوب", href: "/contact" },
  secondaryCta: { label: "استعراض الخدمات", href: "/services" },
} as const;

export const guidedIntentsAr = [
  {
    id: "website",
    label: "موقع أو منصّة رقمية للعلامة",
    href: "/services/web-design-development",
  },
  {
    id: "content",
    label: "محتوى وحملات بأهداف قياسية",
    href: "/services/content-campaigns",
  },
  {
    id: "creative-ai",
    label: "إنتاج إبداعي مسرَّع بذكاء — بحوكمة واعتماد",
    href: "/services/ai-creative",
  },
  {
    id: "enterprise",
    label: "ذكاء مؤسسي وأتمتة للإنتاج",
    href: "/enterprise",
  },
] as const;

export const trustSectionIntroAr = {
  title: "تعاون يُقاس بالتسليم",
  description:
    "نطاق واضح، وجدول معلن، ومسؤول واحد عن المخرجات — مع توثيق يليق بعرض الإدارة ولجنة المشاريع.",
} as const;

export const trustPointsAr = [
  {
    title: "مسقط مقرٌّ، والخليج سياق التشغيل",
    body: "قرب من قراراتكم، وفهم عملي للامتثال والتوقعات المحلية، والتعامل مع الأطراف عبر الحدود عند الحاجة.",
  },
  {
    title: "جودة تُراجع قبل التسليم",
    body: "تصميم وهندسة وإنتاج — بمسار مراجعة، لا مخرجات عاجلة بلا اسم يتحمّلها.",
  },
  {
    title: "ذكاء يرتبط بواقعكم",
    body: "نماذج وتكاملات تُبنى على بياناتكم وحدود الصلاحية والتدقيق — لا أدوات عامة تُلصق بشعاركم.",
  },
  {
    title: "وضوح تجاري من اليوم الأول",
    body: "نطاق ومخرجات وزمن متفق عليها. أي توسّع يُسجَّل ويُقارن أثره قبل التنفيذ.",
  },
];

export const servicesSectionIntroAr = {
  title: "أربعة محاور، وغالبًا في عقد واحد",
  description:
    "كيف تظهرون للسوق، كيف تصلون للجمهور، وكيف تضبطون التشغيل بالذكاء — بخط واحد للمساءلة.",
} as const;

export const pillarServicesAr: ServiceCard[] = [
  {
    id: "web",
    title: "تصميم وتطوير المواقع والمنصّات",
    description:
      "مواقع مؤسسات وتجارب رقمية: أداء، إتاحة، وتعدد لغات يناسب عُمان والخليج — من الصفحة الأولى إلى التشغيل.",
    href: "/services/web-design-development",
    categoryKey: "WEB_DESIGN_DEVELOPMENT",
  },
  {
    id: "content",
    title: "محتوى وحملات",
    description:
      "تقويم إنتاج، وحملات مربوطة بأهداف — لا حشو بلا ربط بالنتائج التجارية.",
    href: "/services/content-campaigns",
    categoryKey: "CONTENT_CAMPAIGNS",
  },
  {
    id: "ai-creative",
    title: "إبداع معزّز بالذكاء — بحوكمة",
    description:
      "تسريع إنتاج الصور والنص والفيديو بضوابط العلامة والمراجعة قبل أي نشر.",
    href: "/services/ai-creative",
    categoryKey: "AI_CREATIVE",
  },
  {
    id: "enterprise",
    title: "ذكاء مؤسسي وأتمتة",
    description:
      "مساعدين خاصّين، وتكاملات، وسير عمل — لمؤسسات تتجاوز برامج المستهلك.",
    href: "/enterprise",
    categoryKey: "ENTERPRISE_AI",
  },
];

export const enterpriseHighlightAr = {
  headline: "نبني أنظمة تشغيل — لا مواقع فقط",
  body: "التسليم الرقمي طبقة ظاهرة. تحتها نهندس ذكاءً خاصاً وأتمتة وأدوات داخلية تعمل ضمن نموذج أمنكم ومسارات الاعتماد وتشغيلكم الفعلي.",
  bullets: [
    {
      title: "أنظمة ذكاء خاصة",
      text: "مساعدة واسترجاع مرتبطان بمصادر تعتمدونها — بصلاحيات هوية وسجلات عند الحاجة ونشر يناسب قيود تقنيتكم.",
    },
    {
      title: "أتمتة سير العمل",
      text: "تدفقات موثّقة عبر CRM وتذاكر ومالية ومراسلات — مع مراقبة وتعامل مع الأخطاء وأدلة يمكن لتشغيلكم تدقيقها.",
    },
    {
      title: "أنظمة ولوحات داخلية",
      text: "أدوات وعروض يومية لفريقكم: ملكية واضحة، وتسليم يمكن صيانته، وأدلة تشغيل ليمسك فريقكم الداخلي ما نسلّمه.",
    },
  ],
  cta: { label: "ابدأوا المحادثة", href: "/contact" },
} as const;

export const industriesSectionIntroAr = {
  title: "قطاعات نخدمها",
  description:
    "نضبط الأسلوب والقنوات والمخاطر حسب طبيعة كل قطاع — دون قوالب واحدة لكل العملاء.",
} as const;

export const industriesAr: IndustryItem[] = [
  {
    label: "التجزئة والتجارة",
    description:
      "هوية رقمية، وصفحات تحويل، وتناغم بين المتجر والقنوات لنمو موجّه بالأرقام.",
  },
  {
    label: "الضيافة والسياحة",
    description:
      "حجوزات واستفسارات وخدمة ضيف عبر القنوات الرقمية بمستوى ثابت.",
  },
  {
    label: "العقار والممتلكات",
    description:
      "عروض واستفسارات ومواد تسويقية لوسطاء ومطوّرين يحتاجون مصداقية فورية.",
  },
  {
    label: "الرعاية الصحية",
    description:
      "حضور واضح ومحتوى يراعي الخصوصية، ومسارات تواصل مع المراجعين بثقة.",
  },
  {
    label: "الخدمات المهنية",
    description:
      "مواقع مكاتب وحملات تناسب الاستشارات والمهن المنظّمة والسمعة المهنية.",
  },
  {
    label: "الجهات وشبه الحكومية",
    description:
      "دعم مسارات تحوّل رقمي بما يتماشى مع التوجهات والحوكمة والشفافية التشغيلية.",
  },
];

export const finalCtaAr = {
  headline: "ابدأوا بخطوة واحدة مدروسة",
  body: "أرسلوا الهدف والجدول الزمني وأصحاب القرار. نرد بمسار عمل مقترح — لا عرضًا عامًا بلا صلة بالواقع.",
  buttonLabel: "تواصل مع إستيو",
  href: "/contact",
} as const;
