import type { AppLocale } from "@/lib/i18n/config";

export type AboutExtended = {
  publishKicker: string;
  publishH2: string;
  publishBody: string[];
  publishLinkLabel: string;
  hoursKicker: string;
  hoursH2: string;
  hoursBody: string;
};

const en: AboutExtended = {
  publishKicker: "What we publish",
  publishH2: "Guides from the studio, not a content mill",
  publishBody: [
    "Beside the service pages we publish long-form notes on how bilingual sites, campaign kits, and governed AI production actually run in Oman and the wider GCC. They are written by the people who scope and deliver the work in Muscat — with a second internal read before anything goes live.",
    "We do not ship thin translations, placeholder articles, or pages that exist only to host advertisements. Editorial rules — who writes, what we refuse to claim, and how advertising is limited to substantial pages — are public in Resources.",
  ],
  publishLinkLabel: "Editorial standards",
  hoursKicker: "Studio",
  hoursH2: "Where and when we work",
  hoursBody:
    "Estio works Sunday–Thursday, Gulf time, from Qurum, Muscat. We reply to enquiries within one business day in Arabic, English, or both. Most delivery is remote with written checkpoints; on-site workshops are scheduled when the statement of work requires them. Phone, WhatsApp, and email are on the Contact page — not a ticket maze.",
};

const ar: AboutExtended = {
  publishKicker: "ماذا ننشر",
  publishH2: "أدلة من الاستوديو لا مزرعة محتوى",
  publishBody: [
    "إلى جانب صفحات الخدمات ننشر ملاحظات مطولة عن كيف تُدار المواقع ثنائية اللغة وحزم الحملات وإنتاج الذكاء المحكوم في عُمان والخليج. يكتبها من يحددون النطاق ويسلّمون العمل في مسقط — مع قراءة داخلية ثانية قبل النشر.",
    "لا ننشر ترجمات رقيقة ولا مقالات مؤقتة ولا صفحات وُجدت فقط لاستضافة إعلانات. قواعد التحرير — من يكتب، وما نرفض ادّعاءه، وكيف يُحصر الإعلان في الصفحات الجوهرية — معلنة في المقالات.",
  ],
  publishLinkLabel: "معايير التحرير",
  hoursKicker: "الاستوديو",
  hoursH2: "أين ومتى نعمل",
  hoursBody:
    "تعمل إستيو الأحد–الخميس بتوقيت الخليج من القرم في مسقط. نرد على الاستفسارات خلال يوم عمل بالعربية أو الإنجليزية أو كلتيهما. أغلب التسليم عن بُعد مع نقاط تفتيش مكتوبة؛ وتُجدول الورش في الموقع عندما يطلب نطاق العمل ذلك. الهاتف وواتساب والبريد في صفحة الاتصال — لا متاهة تذاكر.",
};

export function getAboutExtended(locale: AppLocale): AboutExtended {
  return locale === "ar" ? ar : en;
}
