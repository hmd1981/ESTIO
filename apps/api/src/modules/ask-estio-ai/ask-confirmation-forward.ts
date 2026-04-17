import type { AskReplyLocale } from './ask-user-language';

type ProdIntent = 'images' | 'video' | 'brand';

/**
 * Short, forward-only copy after user confirmation — no product re-pitch.
 * Two lines max; points to in-app CTAs below the bubble.
 */
export function buildConfirmationForwardMessage(
  rl: AskReplyLocale,
  intent: ProdIntent,
  useCase?: string,
): string {
  const uc = useCase?.trim();
  const ucFrag = uc ? ` ${uc}` : '';

  if (rl === 'ar') {
    if (intent === 'video') {
      return uc
        ? `ممتاز — أجهز لك عرض سريع لفيديوهات${ucFrag}.\nاستخدم الزر أدناه لما تكون جاهز تكمل.`
        : `ممتاز — أجهز لك عرض سريع للفيديو القصير.\nاستخدم الزر أدناه لما تكون جاهز تكمل.`;
    }
    if (intent === 'brand') {
      return uc
        ? `ممتاز — نكمّل على نظام العلامة${ucFrag} بعرض محدد.\nالخطوة الجاية من الزر تحت.`
        : `ممتاز — نكمّل على نظام العلامة بعرض محدد.\nالخطوة الجاية من الزر تحت.`;
    }
    return uc
      ? `عالي — بروح مباشرة لبرآورد سريع لمرئيات${ucFrag}.\nاضغط الزر تحت لما تجهز.`
      : `عالي — بروح مباشرة لبرآورد سريع للمرئيات.\nاضغط الزر تحت لما تجهز.`;
  }

  if (rl === 'fa') {
    if (intent === 'video') {
      return uc
        ? `عالی — می‌رم سراغ یک برآورد سریع برای ویدیوی${ucFrag}.\nوقتی آماده‌ای از دکمه پایین ادامه بده.`
        : `عالی — می‌رم سراغ یک برآورد سریع برای ویدیوی کوتاه.\nوقتی آماده‌ای از دکمه پایین ادامه بده.`;
    }
    if (intent === 'brand') {
      return uc
        ? `عالی — برای سیستم برند${ucFrag} یک برآورد دقیق می‌چینم.\nقدم بعدی با دکمه پایین.`
        : `عالی — برای سیستم برند یک برآورد دقیق می‌چینم.\nقدم بعدی با دکمه پایین.`;
    }
    return uc
      ? `عالی — می‌رم سراغ یک برآورد سریع برای تصویر${ucFrag}.\nبا دکمه پایین ادامه بده.`
      : `عالی — می‌رم سراغ یک برآورد سریع برای تصویر.\nبا دکمه پایین ادامه بده.`;
  }

  if (intent === 'video') {
    return uc
      ? `Great — I'll line up a quick scoped quote for${ucFrag} short video work.\nUse the button below when you're ready to continue.`
      : `Great — let's move this into a quick scoped quote for short video.\nUse the button below when you're ready to continue.`;
  }
  if (intent === 'brand') {
    return uc
      ? `Perfect — next step is a scoped quote for your${ucFrag} brand system.\nContinue with the button below.`
      : `Perfect — next step is a scoped quote for your brand system.\nContinue with the button below.`;
  }
  return uc
    ? `Perfect — I can put together a quick quote for your${ucFrag} visuals.\nTap the button below when you're ready.`
    : `Perfect — let's move this into a quick scoped quote for your visuals.\nTap the button below when you're ready.`;
}

/** When model output is too close to the prior assistant turn. */
export function buildDedupeForwardMessage(
  rl: AskReplyLocale,
  intent: ProdIntent,
  useCase?: string,
): string {
  const uc = useCase?.trim();
  if (rl === 'ar') {
    return uc
      ? `تمام — نكمّل من هنا بدون تكرار: الخطوة الجاية عرض سريع لـ${uc}.\nاستخدم الأزرار تحت.`
      : `تمام — نكمّل من هنا: الخطوة الجاية عرض سريع.\nاستخدم الأزرار تحت.`;
  }
  if (rl === 'fa') {
    return uc
      ? `باشه — بدون تکرار، قدم بعدی برآورد سریع برای ${uc} است.\nاز دکمه‌ها پایین برو جلو.`
      : `باشه — بدون تکرار، قدم بعدی برآورد سریع است.\nاز دکمه‌ها پایین برو جلو.`;
  }
  return uc
    ? `Got it — picking up from here without repeating: next step is a quick quote for ${uc}.\nUse the buttons below.`
    : `Got it — picking up from here: next step is a quick scoped quote.\nUse the buttons below.`;
}
