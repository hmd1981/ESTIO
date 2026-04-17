import type { Request } from 'express';
import type { AskContextDto } from './dto/ask-context.dto';
import type { AskHistoryItemDto } from './dto/ask-history-item.dto';
import type { AiStudioAskDto } from './dto/ai-studio-ask.dto';
import type { AskReplyLocale } from './ask-user-language';
import { resolveReplyLocale } from './ask-user-language';

const GCC_COUNTRIES = new Set([
  'AE',
  'SA',
  'OM',
  'QA',
  'KW',
  'BH',
]);

/** Prefer simple modern Arabic (not Gulf colloquial) when user likely outside GCC. */
const MSA_LEAN_COUNTRIES = new Set([
  'EG',
  'MA',
  'DZ',
  'TN',
  'LB',
  'JO',
  'IQ',
  'PS',
  'SD',
  'YE',
  'SO',
  'DJ',
  'KM',
  'MR',
  'LY',
]);

export type AskToneIntentBias = 'images' | 'video' | 'brand' | 'unknown';

export type ToneContext = {
  /** Site / page language (navigation, analytics). */
  pageLocale: 'en' | 'ar';
  /** Language the assistant must write "message" in. */
  replyLocale: AskReplyLocale;
  dialect: 'gcc' | 'msa';
  formality: 'casual';
  verbosity: 'short';
  intentBias: AskToneIntentBias;
};

const BANNED_AR_PHRASES: RegExp[] = [
  /يتوافق\s+مع/gi,
  /نحن\s+متخصصون\s+في/gi,
  /هذا\s+الحل\s+مصمم/gi,
  /هذا\s+العرض\s+مصمم/gi,
  /يمكننا\s+أن\s+نقدم\s+لك/gi,
  /نستطيع\s+إنشاء/gi,
];

/** When the model omits a closing question, append a short line (max 4 lines enforced). */
export const MESSAGE_FALLBACK_CTA: Record<
  AskReplyLocale,
  Record<AskToneIntentBias, string>
> = {
  en: {
    images: 'Want to start with a few visuals?',
    video: 'Want to start with a few short videos?',
    brand: 'Want to lead with still visuals or short video for your brand?',
    unknown: 'Are you starting with still images or short video?',
  },
  ar: {
    images: 'نبدأ بصور؟',
    video: 'نبدأ بفيديوهات قصيرة؟',
    brand: 'تبغى نبدأ بصور ثابتة أو بفيديو قصير للعلامة؟',
    unknown: 'تفضّل صور ولا فيديو قصير؟',
  },
  fa: {
    images: 'می‌خوای با چند تصویر شروع کنیم؟',
    video: 'می‌خوای با ویدیوی کوتاه شروع کنیم؟',
    brand: 'ترجیح می‌دی اول با تصویر شروع کنیم یا ویدیوی کوتاه؟',
    unknown: 'می‌خوای با تصویر شروع کنیم یا ویدیوی کوتاه؟',
  },
};

/** Turn 5+ — closing line must not be a question (statements only). */
export const STATEMENT_CTA_BY_REPLY: Record<
  AskReplyLocale,
  Record<AskToneIntentBias, string>
> = {
  en: {
    images: 'We can start with a focused set of visuals whenever you are ready.',
    video: 'We can start with a few short clips whenever you are ready.',
    brand: 'We can line up stills or short motion for your brand — ready when you are.',
    unknown: 'Tell us if you want to start with visuals or a short quote — we will take it from there.',
  },
  ar: {
    images: 'نقدر نبدأ بمجموعة صور مركّزة بمجرد ما تكون جاهز.',
    video: 'نقدر نبدأ بمقاطع قصيرة بمجرد ما تكون جاهز.',
    brand: 'نقدر نرتّب صور أو حركة قصيرة للعلامة — جاهزين نبدأ لما تبغى.',
    unknown: 'قلنا تبغى تبدأ بصور أو بعرض سريع — ونكمل معك من هناك.',
  },
  fa: {
    images: 'هر وقت آماده‌ای می‌تونیم با چند تصویر هدفمند شروع کنیم.',
    video: 'هر وقت آماده‌ای می‌تونیم با چند ویدیوی کوتاه شروع کنیم.',
    brand: 'می‌تونیم برای برندت تصویر یا ویدیوی کوتاه بچینیم — هر وقت بگی ادامه می‌دیم.',
    unknown: 'بگو تصویر می‌خوای یا یک برآورد سریع — از همونجا جلو می‌ریم.',
  },
};

function headerCountry(req: Request): string {
  const cf = req.headers['cf-ipcountry'];
  if (typeof cf === 'string' && cf.trim()) return cf.trim().toUpperCase();
  const vc = req.headers['x-vercel-ip-country'];
  if (typeof vc === 'string' && vc.trim()) return vc.trim().toUpperCase();
  return 'OM';
}

/** Infer Arabic dialect hint from Accept-Language (optional). */
function dialectFromAcceptLanguage(req: Request): 'gcc' | 'msa' | null {
  const al = req.headers['accept-language'];
  if (typeof al !== 'string' || !al.trim()) return null;
  const lower = al.toLowerCase();
  if (/\bar-(ae|sa|om|qa|kw|bh)\b/.test(lower)) return 'gcc';
  if (/\bar-(eg|ma|dz|tn|lb|jo|iq)\b/.test(lower)) return 'msa';
  return null;
}

function normalizeIntentBias(
  v: string | undefined,
): AskToneIntentBias {
  const x = String(v ?? '')
    .trim()
    .toLowerCase();
  if (x === 'images' || x === 'image') return 'images';
  if (x === 'video' || x === 'videos') return 'video';
  if (x === 'brand' || x === 'pack' || x === 'packs') return 'brand';
  if (x === 'unknown') return 'unknown';
  return 'unknown';
}

export function buildToneContext(
  req: Request,
  dto: AiStudioAskDto,
  replyLocale: AskReplyLocale,
): ToneContext {
  const pageLocale: 'en' | 'ar' = dto.pageLocale === 'ar' || dto.locale === 'ar' ? 'ar' : 'en';
  const country = headerCountry(req);
  const alDialect = dialectFromAcceptLanguage(req);

  let dialect: 'gcc' | 'msa';
  if (replyLocale === 'ar') {
    if (alDialect) {
      dialect = alDialect;
    } else if (GCC_COUNTRIES.has(country)) {
      dialect = 'gcc';
    } else if (MSA_LEAN_COUNTRIES.has(country)) {
      dialect = 'msa';
    } else {
      dialect = 'gcc';
    }
  } else {
    dialect = 'msa';
  }

  return {
    pageLocale,
    replyLocale,
    dialect,
    formality: 'casual',
    verbosity: 'short',
    intentBias: normalizeIntentBias(
      dto.intentHint ?? dto.context?.intent,
    ),
  };
}

/** Resolve reply language: prefer server detection; fall back to client hint then page. */
export function resolveAskReplyLocale(
  dto: AiStudioAskDto,
  serverDetected: import('./ask-user-language').DetectedUserLanguage,
): AskReplyLocale {
  const pageLocale: 'en' | 'ar' =
    dto.pageLocale === 'ar' || dto.locale === 'ar' ? 'ar' : 'en';
  const merged: import('./ask-user-language').DetectedUserLanguage =
    serverDetected !== 'unknown'
      ? serverDetected
      : (dto.detectedLanguage ?? 'unknown');
  return resolveReplyLocale(merged, pageLocale);
}

export type ConfirmationAdvanceOpts = {
  confirmationAdvance: boolean;
  normalizedStage: string;
};

/** Broad funnel CTA lock: strict product+fit signals, late turn, or confirmation at ready/action. */
export function computeForceProductionCta(
  dto: AiStudioAskDto,
  turnCount: number,
  confirm?: ConfirmationAdvanceOpts,
): boolean {
  const ctx = dto.context;
  const hasUseCase = Boolean(ctx?.useCase?.trim());
  const hasPlat = Boolean(ctx?.platform?.trim());
  const hasProdIntent =
    ctx?.intent === 'images' ||
    ctx?.intent === 'video' ||
    ctx?.intent === 'brand';
  const stage = confirm?.normalizedStage ?? '';
  const confirmLock =
    confirm?.confirmationAdvance === true &&
    (stage === 'ready' || stage === 'action');
  return (
    shouldForceAskProductionCta(ctx) ||
    turnCount >= 4 ||
    (hasProdIntent && (hasUseCase || hasPlat)) ||
    confirmLock
  );
}

const BASE_CORE = `You are Ask Estio AI.

Your job is to help users quickly understand what they need and guide them toward the right Estio AI Studio production service.

You only discuss:
- AI still images (e.g. Instagram or Meta ads, product pages, email headers, catalog shots)
- Short-form video (e.g. reels, TikTok-style clips, short promos for social)
- Brand systems (e.g. one visual ruleset reused across landing pages, ads, and social)

You are not a general chatbot, support desk, or research assistant. Do not answer unrelated topics (politics, health, law, coding homework, random trivia, open-ended chat).

CONTRACT (never break)
- Output JSON must stay exactly: { "message", "intent", "outOfScope" } — no extra keys, no markdown.
- Keep intent classification rules below; "message" must follow the same four beats in order.

STRUCTURE of "message" (always, in order — tone adapts by locale/dialect, structure does not)
1) Acknowledge / understand what they want
2) Simple explain what Estio can do — you MUST name at least one real-world usage example (pick what fits: Instagram, social/Meta ads, landing pages, reels, TikTok, product pages — not vague "channels" or "platforms" alone)
3) One practical benefit only: concrete outcomes (ready to publish, no photoshoot, faster campaign launch, drop straight into ads). NEVER use generic benefit phrases such as: high quality, professional, innovative, robust, best-in-class, premium, compelling, impactful, cutting-edge, seamless, world-class — or Arabic equivalents used as empty praise
4) Closing CTA must push a clear next step; when helpful, steer toward choosing or starting with still images vs short video (even for brand asks, you can frame as visuals vs motion)

If their ask is unclear but still on-topic: intent "unknown", outOfScope false, one short clarification only — prefer a single question that splits images vs video (or confirms which they need first).

If clearly outside scope: intent "unknown", outOfScope true; briefly redirect to contact Estio for anything beyond images / short-form video / brand systems.

Classification
- intent "images": still visuals, ads, product/campaign images, hotel or e-commerce shots, etc.
- intent "video": reels, TikTok-style, short promos, social video, ad spots.
- intent "brand": consistency, visual system, scaling branded content, brand packs.
- intent "unknown": unclear on-topic ask (clarify) OR off-scope (outOfScope true).

Do not invent pricing, timelines, or guarantees. Do not mention prompts, models, or internal routing.

The app maps intent to offers and button labels — do not put offer names or CTA button copy in JSON beyond what appears inside "message" as normal prose.`;

function renderTurnFunnelBlock(turnCount: number): string {
  return `
--------------------------------
TURN FUNNEL (session)
--------------------------------
- turnCount is the number of completed user→assistant rounds BEFORE this message (0 = first user message).
- Hard cap: finish in at most 4–5 turns — after turnCount >= 4 you must push to action, not keep exploring.
- Turn 1: infer intent / fit. Turn 2: at most ONE clarification if needed (never two discovery questions in a row).
- Once session intent AND use-case (or platform) are known: do NOT ask discovery questions again; advance toward quote / start production.
- If the user gives a short confirmation (yes/ok/sure/نعم/بله…): do NOT repeat your prior explanation — hand off in 1–2 short lines toward action.
- Do not repeat questions the user already answered in history or session context.
- Current turnCount (before this reply): ${turnCount}
`.trim();
}

const CONVERSATION_CONTROL = `
--------------------------------
CONVERSATION CONTROL
--------------------------------
- You may receive recent conversation history and session fields — treat them as memory; continue naturally; never re-ask what was already settled.
- Ask at most ONE clarification question in "message" per turn when intent or use-case is still unclear.
- Once intent AND use-case (or platform) are both known from context: stop discovery — no more "what do you need" loops; move to quote / start / contact path.
- After turnCount >= 3, bias heavily toward a clear next step (still images vs short video vs brand pack, then starting production).
- Never paraphrase the same sales explanation twice when the user already agreed — acknowledge briefly and move forward.
- Your goal is a short guided path to conversion, not open-ended chat.
`.trim();

function renderConfirmationHandoffBlock(): string {
  return `
--------------------------------
CONFIRMATION HANDOFF (active)
--------------------------------
- The latest user message is a short confirmation. Session already has production intent and enough fit context.
- Forbidden: repeating "we create images for Instagram…", repeating benefits, re-asking the same CTA you already asked.
- Required: EXACTLY 2 very short lines — (1) quick acknowledgment, (2) forward motion toward scoped quote or starting production (reference the in-app buttons). No question marks.
- Keep the same response language as specified in RESPONSE LANGUAGE.
`.trim();
}

function renderForceCtaGuardrail(): string {
  return `
--------------------------------
HARD GUARDRAIL (FORCE_PRODUCTION_CTA)
--------------------------------
- Forced because: session has production intent and/or use-case and/or turnCount >= 4.
- Do NOT ask any clarification or discovery question in "message".
- Use exactly 4 short lines: (1) acknowledge their need (use-case if known), (2) one concrete Estio capability with a named surface (Instagram, ads, landing pages, reels, TikTok — pick what fits), (3) one practical benefit only, (4) one closing line that pushes starting production (match images vs video vs brand when known — avoid "images or video?" forks when intent is already clear).
- Set JSON "intent" to match the best production line — not "unknown" unless the latest user message clearly contradicts scope or is off-topic (then outOfScope true).
`.trim();
}

function renderTerminalTurnGuardrail(): string {
  return `
--------------------------------
HARD GUARDRAIL (TURN 5+ — NO QUESTIONS)
--------------------------------
- turnCount >= 5: the closing line of "message" MUST NOT be a question (no "?" or "؟" or Persian question mark).
- End with a clear, confident call to action as a statement (e.g. ready to start visuals, or invite to request a quick quote) in the RESPONSE LANGUAGE.
- Still use four short lines; line 4 must be a statement, not a question.
`.trim();
}

function renderResponseLanguageBlock(
  ctx: ToneContext,
  detectedLabel: string,
): string {
  const page = ctx.pageLocale;
  const reply = ctx.replyLocale;
  const dialectNote =
    reply === 'ar'
      ? ctx.dialect === 'gcc'
        ? 'Gulf-friendly spoken Arabic where natural.'
        : 'Simple modern Arabic (MSA-lean), not formal paperwork.'
      : '';
  return `
--------------------------------
RESPONSE LANGUAGE (mandatory)
--------------------------------
- Page locale (site UI only): ${page}
- Detected latest-message language label: ${detectedLabel}
- You MUST write the entire JSON "message" in: ${reply === 'en' ? 'natural English' : reply === 'ar' ? `natural Arabic (${dialectNote})` : 'natural Persian (Farsi)'}
- Do NOT follow page locale if it conflicts with the detected user language — the user may write English on an Arabic page or Arabic on an English page.
- Do NOT translate the user's words unnecessarily; mirror their language consistently across the session unless they clearly switch language.
`.trim();
}

/** Matches client contract: both intent and use-case present (any intent value). */
export function hasAskContextIntentAndUseCase(
  context: AskContextDto | undefined,
): boolean {
  return Boolean(context?.intent && context?.useCase?.trim());
}

/**
 * Hard production CTA lock: session includes a concrete product line + use-case.
 * Used for FORCE_CTA prompt block, intent coercion, and normalizeAskMessage.
 */
export function shouldForceAskProductionCta(
  context: AskContextDto | undefined,
): boolean {
  if (!hasAskContextIntentAndUseCase(context)) return false;
  const i = context!.intent;
  return i === 'images' || i === 'video' || i === 'brand';
}

export function formatAskSessionContextForUserPrompt(
  context: AskContextDto | undefined,
): string {
  if (!context) return '';
  const has =
    Boolean(context.intent) ||
    Boolean(context.useCase?.trim()) ||
    Boolean(context.platform?.trim()) ||
    Boolean(context.stage?.trim()) ||
    (context.recentUserMessages?.length ?? 0) > 0;
  if (!has) return '';

  const lines: string[] = [
    '--- Client session context (honor unless the latest user message clearly contradicts) ---',
  ];
  if (context.intent) lines.push(`intent: ${context.intent}`);
  if (context.useCase?.trim()) lines.push(`useCase: ${context.useCase.trim()}`);
  if (context.platform?.trim()) lines.push(`platform: ${context.platform.trim()}`);
  if (context.stage?.trim()) lines.push(`stage: ${context.stage.trim()}`);
  if (context.recentUserMessages?.length) {
    lines.push('Previous user messages (oldest first):');
    for (const m of context.recentUserMessages) {
      lines.push(`- ${JSON.stringify(m)}`);
    }
  }
  lines.push('--- end client session context ---');
  return lines.join('\n');
}

export function formatAskHistoryForUserPrompt(
  history: AskHistoryItemDto[] | undefined,
): string {
  if (!history?.length) return '';
  const lines: string[] = [
    '--- Recent conversation (last turns only, oldest first; current user message is separate below) ---',
  ];
  for (const h of history) {
    const role = h.role === 'user' ? 'user' : 'assistant';
    lines.push(`${role}: ${JSON.stringify(h.content)}`);
  }
  lines.push('--- end recent conversation ---');
  return lines.join('\n');
}

function renderToneBlock(ctx: ToneContext): string {
  const lines = [
    '[TONE MODE]',
    '',
    `Page locale (site only): ${ctx.pageLocale}`,
    `Response language: ${ctx.replyLocale}`,
    `Arabic dialect hint (only if writing Arabic): ${ctx.dialect}`,
    `Formality: ${ctx.formality}`,
    `Verbosity: ${ctx.verbosity}`,
    `Intent bias (hint only): ${ctx.intentBias}`,
    '',
    'RULES:',
    '- Same structure: acknowledge → simple explain → one practical benefit → closing line (question allowed unless TURN 5+ guardrail says otherwise).',
    '- Max 4 short lines in "message" (each line natural speech).',
    '- Always one named real-world example in line 2 (Instagram, ads, landing pages, reels, TikTok — specific).',
    '- Benefits: practical only; never generic praise (quality/premium/innovative/professional as fluff).',
    '- When intent still unclear and not in force-CTA mode, one clarification question is allowed (images vs short video).',
    '',
  ];

  if (ctx.replyLocale === 'en') {
    lines.push(
      'IF response language = English:',
      '- Clean, direct SaaS tone: friendly, concise, not corporate.',
      '- Examples must be concrete: Instagram or Meta ads, landing pages, reels/TikTok, product pages.',
      '- CTA: steer the user (e.g. stills vs short video, or quote) when appropriate.',
    );
  } else if (ctx.replyLocale === 'ar' && ctx.dialect === 'gcc') {
    lines.push(
      'IF response language = Arabic (Gulf):',
      '- Natural Gulf Arabic (spoken). Do NOT translate from English.',
      '- Prefer: واضح إنك… / شكلك تبغى… / نقدر نجهز لك… / جاهز للنشر / بدون تصوير / بسرعة',
      '- Name real surfaces: إنستغرام، إعلانات، صفحة هبوط، ريلز، تيك توك — not vague "منصات".',
      '- لا تستخدم مزايا فضفاضة: احترافي، عالي الجودة، مميز، مبتكر كمديح فارغ.',
      '- Never: هل ترغب في… / هل تود البدء… / يرجى… / يتوافق مع / نحن متخصصون',
    );
  } else if (ctx.replyLocale === 'ar') {
    lines.push(
      'IF response language = Arabic (MSA-lean):',
      '- Simple, modern Arabic (not classical, not formal paperwork).',
      '- Name concrete surfaces: إنستغرام، إعلانات، صفحة هبوط، تيك توك، ريلز.',
      '- Avoid empty quality praise; avoid stiff "هل ترغب" / "يرجى".',
    );
  } else {
    lines.push(
      'IF response language = Persian (Farsi):',
      '- Natural, modern Persian — not literal translation from English.',
      '- Name concrete surfaces: اینستاگرام، تبلیغات، لندینگ، ریلز، تیک‌تاک.',
      '- Warm, concise tone; avoid stiff formal openings.',
    );
  }

  return lines.join('\n');
}

function renderFewShot(ctx: ToneContext): string {
  if (ctx.replyLocale === 'en') {
    return `
FEW-SHOT (English — match this shape and tone; do not copy verbatim every time)

User: I need ad visuals
Assistant message body:
Got it — you need visuals for ads.

We can create clean images for Instagram ads or landing pages that are ready to use right away.

Most teams use these to launch campaigns fast without a photoshoot.

Want to start with a few visuals?
`.trim();
  }
  if (ctx.replyLocale === 'ar' && ctx.dialect === 'gcc') {
    return `
FEW-SHOT (Arabic GCC — match this shape and tone; do not copy verbatim every time)

User: أحتاج صور للإعلانات
Assistant message body:
واضح إنك تحتاج صور للإعلانات.

نقدر نجهز لك صور جاهزة للنشر على إنستغرام أو الحملات مباشرة.

الميزة إنها بدون تصوير أو تجهيز معقد.

نبدأ معك بمجموعة صور؟
`.trim();
  }
  if (ctx.replyLocale === 'ar') {
    return `
FEW-SHOT (Arabic — simple modern MSA-friendly; not Gulf slang-heavy)

User: أحتاج صورًا للحملات
Assistant message body:
يبدو أنك تحتاج صورًا للإعلانات.

نقدر نجهّز صورًا جاهزة للنشر على إنستغرام أو في الحملات مباشرة.

بدون جلسة تصوير معقّدة.

نبدأ بمجموعة صور؟
`.trim();
  }
  if (ctx.replyLocale === 'fa') {
    return `
FEW-SHOT (Persian — match this shape and tone; do not copy verbatim every time)

User: برای اینستاگرامم به تصویر تبلیغاتی نیاز دارم
Assistant message body:
متوجه‌ام — برای تبلیغات اینستاگرام به تصویر نیاز داری.

می‌تونیم تصویرهای آماده انتشار برای اینستاگرام یا لندینگ بسازیم.

بدون دردسر شبیه جلسه عکاسی سنتی.

دوست داری با چند تصویر شروع کنیم؟
`.trim();
  }
  return '';
}

export function buildAskEstioAiSystemPrompt(
  ctx: ToneContext,
  opts?: {
    forceProductionCta?: boolean;
    terminalNoQuestions?: boolean;
    turnCount?: number;
    detectedLanguageLabel?: string;
    confirmationHandoff?: boolean;
  },
): string {
  const few = renderFewShot(ctx);
  const fewBlock = few ? `\n\n${few}\n` : '\n';
  const forceBlock =
    opts?.forceProductionCta === true
      ? `\n\n${renderForceCtaGuardrail()}\n`
      : '\n';
  const confirmBlock =
    opts?.confirmationHandoff === true
      ? `\n\n${renderConfirmationHandoffBlock()}\n`
      : '\n';
  const terminalBlock =
    opts?.terminalNoQuestions === true
      ? `\n\n${renderTerminalTurnGuardrail()}\n`
      : '\n';
  const turnN = Math.max(0, Math.min(50, opts?.turnCount ?? 0));
  const langBlock = renderResponseLanguageBlock(
    ctx,
    opts?.detectedLanguageLabel ?? 'unknown',
  );

  return `${BASE_CORE}

${langBlock}

${renderTurnFunnelBlock(turnN)}

${CONVERSATION_CONTROL}
${forceBlock}
${confirmBlock}
${terminalBlock}
${renderToneBlock(ctx)}
${fewBlock}
OUTPUT FORMAT — return valid JSON only, exactly this shape (no markdown, no extra keys):

{
  "message": "string",
  "intent": "images" | "video" | "brand" | "unknown",
  "outOfScope": false
}`;
}

export type NormalizedAskIntent = 'images' | 'video' | 'brand' | 'unknown';

/**
 * Enforce line cap, strip banned Arabic boilerplate, ensure a closing question.
 */
export function normalizeAskMessage(
  message: string,
  ctx: ToneContext,
  intent: NormalizedAskIntent,
  opts?: {
    forceProductionCta?: boolean;
    terminalNoQuestions?: boolean;
    maxLines?: number;
    /** Short, action-only lines; no discovery / no questions. */
    postConfirmationShort?: boolean;
  },
): string {
  let t = message.replace(/\r\n/g, '\n').trim();
  if (!t) return t;

  const maxLines = opts?.postConfirmationShort
    ? 2
    : Math.max(1, Math.min(4, opts?.maxLines ?? 4));

  let lines = t
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (ctx.replyLocale === 'ar') {
    lines = lines.map((line) => {
      let L = line;
      for (const r of BANNED_AR_PHRASES) {
        L = L.replace(r, ' ');
      }
      return L.replace(/\s+/g, ' ').trim();
    }).filter((l) => l.length > 0);
  }

  lines = lines.slice(0, maxLines);

  if (opts?.postConfirmationShort === true) {
    lines = lines
      .map((l) => l.replace(/[?؟？]+\s*$/u, '.').trim())
      .filter((l) => l.length > 0)
      .slice(0, 2);
    return lines.join('\n').trim();
  }

  const ctaKey: AskToneIntentBias =
    opts?.forceProductionCta === true && intent === 'unknown' ? 'brand' : intent;
  const reply = ctx.replyLocale;

  if (opts?.terminalNoQuestions === true) {
    const lastIdx = lines.length - 1;
    const last = lines[lastIdx] ?? '';
    if (/[?؟？]\s*$/.test(last)) {
      const stmt = STATEMENT_CTA_BY_REPLY[reply][ctaKey];
      if (lines.length >= maxLines) {
        lines[maxLines - 1] = stmt;
      } else if (lines.length > 0) {
        lines[lastIdx] = stmt;
      } else {
        lines.push(stmt);
      }
    } else if (lines.length < maxLines) {
      lines.push(STATEMENT_CTA_BY_REPLY[reply][ctaKey]);
    }
    return lines.join('\n').trim();
  }

  const last = lines[lines.length - 1] ?? '';
  const hasQuestionEnd = /[?؟？]\s*$/.test(last);
  if (!hasQuestionEnd) {
    const cta = MESSAGE_FALLBACK_CTA[reply][ctaKey];
    if (lines.length >= maxLines) {
      lines[maxLines - 1] = cta;
    } else {
      lines.push(cta);
    }
  }

  return lines.join('\n').trim();
}
