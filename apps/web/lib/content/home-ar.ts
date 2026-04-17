import type { IndustryItem, ServiceCard } from "./types";

/** Arabic-first defaults when CMS omits home `sections` (GCC / Oman executive tone). */

export const systemIdentityAr = {
  heading: "ماذا نحن",
  body:
    "نموذج تجاري لتقييم وبناء وتسليم أتمتة محدودة النطاق واسترجاع داخلي محكوم فوق تطبيقاتكم — باختبارات قبول كتابية وضمن إجراءات التغيير لديكم.",
  contrast: "ليس وكالة شاملة. ليس بائع تراخيص. ليس مختبر ابتكار بلا ميزانية تشغيل.",
} as const;

export const operationalAlignmentAr = {
  kicker: "الملاءمة التشغيلية",
  title: "غالباً ما تتقاطع أنشطتنا مع مؤسسات تعمل كالتالي",
  points: [
    "بيئة تطبيقات متعددة — إدارة عملاء، تمويل، وأنظمة داخلية مترابطة",
    "سير عمل يعتمد اعتمادات مسماة — لا قرارات مبهمة في البريد",
    "بيانات ووصول محكومان — بسياسات يفرضها تقنيو المعلومات والالتزام",
  ],
  footer:
    "التعاقدات تُدار بقواعد توريد وتغيير وملكية مخاطر إنتاج — لا كتجارب تسويق ولا تجارب مجانية.",
} as const;

export const homeHeroAr = {
  headline: "مرئيات جاهزة للحملات — بسرعة وبلا تشغيل استوديو داخلي.",
  subheadline:
    "صور وفيديو قصير وأصول متسقة مع علامتكم للخليج. تحددون المطلوب؛ نسلّم ملفات جاهزة للنشر.",
  primaryCta: { label: "ابدأ مشروعاً", href: "/contact" },
  secondaryCta: { label: "عرض سعر سريع", href: "/contact" },
} as const;

export const homeHeroIntentLinksAr = [
  { label: "صور", href: "/ai-studio/image-production" },
  { label: "فيديو قصير", href: "/ai-studio/video-production" },
  { label: "نظام علامة", href: "/ai-studio/brand-ai-packs" },
] as const;

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
    label: "أتمتة بين أنظمة مسماة واسترجاع داخلي محكوم",
    href: "/enterprise",
  },
] as const;

export const trustSectionIntroAr = {
  title: "عمل واضح، تسليم حقيقي",
  description:
    "نحدد النطاق كتابياً، نراجع قبل الإطلاق، ونسلّم ملفات تملكونها. مقرّنا مسقط؛ نعمل مع فرق في أنحاء الخليج.",
} as const;

export const trustPointsAr = [
  {
    title: "نطاق قبل التنفيذ",
    body: "تعرفون المخرج والجدول قبل أن نبدأ الإنتاج.",
  },
  {
    title: "مخرجات بمراجعة العلامة",
    body: "لا يُنشر شيء حتى يطابق اتجاهكم وجودتكم.",
  },
  {
    title: "مناسب لفرق الخليج",
    body: "تسليم ثنائي اللغة ورسائل تناسب طريقة اتخاذ القرار عندكم.",
  },
  {
    title: "مسؤول واحد من البداية للنهاية",
    body: "نفس الشخص يتابع المهمة من الموجز إلى الملفات النهائية.",
  },
];

export const servicesSectionIntroAr = {
  title: "أربع ممارسات تنفيذ — كلٌّ بنطاقه",
  description:
    "كل ممارسة لها مخرجاتها ومعايير قبولها. الجمع في عقد واحد يُرتَّب صراحةً — لا تجميعاً عشوائياً في بند «الخدمات الشاملة».",
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
    title: "أتمتة أنظمة واسترجاع محكوم",
    description:
      "تنسيق حتمي بين تطبيقات مسماة، وخدمات استرجاع مربوطة بمصادر معتمدة وصلاحيات الهوية — بنطاق كتابي وتسليم يشغّله تقنيتكم.",
    href: "/enterprise",
    categoryKey: "ENTERPRISE_AI",
  },
];

export const enterpriseHighlightAr = {
  headline: "عندما تحتاجون أنظمة، لا مجرد أصول",
  body: "ما بعد الحملات: أتمتة بين التطبيقات التي تستخدمونها، وأدواء داخلية يشغّلها فريق تقنيتكم. أنظمة مسماة، نطاق كتابي، تسليم واضح.",
  bullets: [
    {
      title: "استرجاع محكوم",
      text: "إجابات من مصادر تدخلونها في قائمة المعتمد صراحة؛ صلاحيات حسب الدور؛ نوايا محظورة؛ احتفاظ سجلات يتماشى مع سياسة الوثائق لديكم — إعداد تشغيلي لا صياغة فقط.",
    },
    {
      title: "أتمتة بين التطبيقات",
      text: "خطوات موثّقة بين إدارة علاقات العملاء والمالية والتذاكر والمراسلات — مع إعادة محاولة وصفوف استثناء ومسار تراجع يملكها التشغيل.",
    },
    {
      title: "أدوات ولوحات داخلية",
      text: "واجهات مراقبة ومسؤوليات معلنة وأدلة تشغيل وتصعيد — تسليم يُسنَد لفريقكم من يوم أول، ما لم يُعَدّ نموذج دعم آخر كتابياً.",
    },
  ],
  cta: { label: "ابدأ مشروعاً", href: "/contact" },
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
  headline: "جاهزون عندما تكونون",
  body: "صفوا ما تبنونه. نرد خلال يوم عمل بخطوة تالية — أو «لا» صريحة إن لم نكن المناسبين.",
  buttonLabel: "ابدأ مشروعاً",
  href: "/contact",
} as const;
