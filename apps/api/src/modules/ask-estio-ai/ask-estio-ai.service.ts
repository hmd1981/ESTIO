import { createHash } from 'node:crypto';
import {
  BadRequestException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { AskEstioAiRateLimitService } from './ask-estio-ai-rate-limit.service';
import type { AiStudioAskDto } from './dto/ai-studio-ask.dto';
import type { AskInteractionDto } from './dto/ask-interaction.dto';
import { DeepseekAskClient } from './deepseek-ask.client';
import {
  buildAskEstioAiSystemPrompt,
  buildToneContext,
  computeForceProductionCta,
  formatAskHistoryForUserPrompt,
  formatAskSessionContextForUserPrompt,
  normalizeAskMessage,
  resolveAskReplyLocale,
} from './ask-estio-ai-prompt';
import {
  detectUserConfirmation,
  normalizeClientFlowStage,
} from './ask-confirmation';
import type { AskReplyLocale } from './ask-user-language';
import { detectUserMessageLanguage } from './ask-user-language';

const INTENTS = ['images', 'video', 'brand', 'unknown'] as const;
type NormalizedIntent = (typeof INTENTS)[number];

type ModelShape = {
  intent?: string;
  /** Preferred user-facing reply (new contract). */
  message?: string;
  /** Legacy field; treated like message if present. */
  answer?: string;
  recommendedOffer?: string;
  recommendedCtaLabel?: string;
  shouldEscalateToContact?: boolean;
  outOfScope?: boolean;
};

/** Canonical offer lines for this assistant (may differ from CRM default labels). */
const ASK_OFFER_BY_INTENT: Record<'images' | 'video' | 'brand', string> = {
  images: 'AI Image Production',
  video: 'Short-form AI Video',
  brand: 'Brand AI System',
};

const ASK_CTA_BY_INTENT: Record<'images' | 'video' | 'brand', string> = {
  images: 'Start image production',
  video: 'Start video production',
  brand: 'Start brand system',
};

const ASK_OFFER_BY_INTENT_AR: Record<'images' | 'video' | 'brand', string> = {
  images: 'إنتاج صور بالذكاء الاصطناعي',
  video: 'فيديو قصير بالذكاء الاصطناعي',
  brand: 'نظام علامة بالذكاء الاصطناعي',
};

const ASK_CTA_BY_INTENT_AR: Record<'images' | 'video' | 'brand', string> = {
  images: 'ابدأ إنتاج الصور',
  video: 'ابدأ إنتاج الفيديو',
  brand: 'ابدأ نظام العلامة',
};

const SCOPED_QUOTE_CTA_EN = 'Request a scoped quote';
const SCOPED_QUOTE_CTA_AR = 'اطلب عرض نطاق';
const SCOPED_QUOTE_CTA_FA = 'درخواست برآورد دقیق';

const ASK_OFFER_BY_INTENT_FA: Record<'images' | 'video' | 'brand', string> = {
  images: 'تولید تصویر با هوش مصنوعی',
  video: 'ویدیوی کوتاه با هوش مصنوعی',
  brand: 'سیستم برند با هوش مصنوعی',
};

const ASK_CTA_BY_INTENT_FA: Record<'images' | 'video' | 'brand', string> = {
  images: 'شروع تولید تصویر',
  video: 'شروع تولید ویدیو',
  brand: 'شروع سیستم برند',
};

const OUT_OF_SCOPE_FA =
  'این دستیار فقط برای تصویر، ویدیوی کوتاه، یا سیستم برند کمک می‌کند. برای بقیه موارد با Estio تماس بگیر.';

const RATE_MSG_FA =
  'درخواست‌های زیاد در زمان کوتاه. لطفاً چند دقیقه صبر کن یا از لینک زیر با Estio تماس بگیر.';

const DISABLED_ANSWER_FA =
  'دستیار «Ask Estio AI» موقتاً در دسترس نیست. برای استودیو از لینک‌های بالا استفاده کن یا مستقیم با Estio تماس بگیر.';

function contactLabel(rl: AskReplyLocale): string {
  if (rl === 'ar') return 'تواصل مع Estio';
  if (rl === 'fa') return 'تماس با Estio';
  return 'Contact Estio';
}

function rateLimitedAnswer(rl: AskReplyLocale): string {
  if (rl === 'ar') return RATE_MSG_AR;
  if (rl === 'fa') return RATE_MSG_FA;
  return RATE_MSG_EN;
}

function disabledAnswer(rl: AskReplyLocale): string {
  if (rl === 'ar') return DISABLED_ANSWER_AR;
  if (rl === 'fa') return DISABLED_ANSWER_FA;
  return DISABLED_ANSWER_EN;
}

function outOfScopeAnswer(rl: AskReplyLocale): string {
  if (rl === 'ar') return OUT_OF_SCOPE_AR;
  if (rl === 'fa') return OUT_OF_SCOPE_FA;
  return OUT_OF_SCOPE_EN;
}

function scopedQuoteCta(rl: AskReplyLocale): string {
  if (rl === 'ar') return SCOPED_QUOTE_CTA_AR;
  if (rl === 'fa') return SCOPED_QUOTE_CTA_FA;
  return SCOPED_QUOTE_CTA_EN;
}

function deepseekFailureAnswer(rl: AskReplyLocale): string {
  if (rl === 'ar') {
    return 'تعذر إكمال الطلب. جرّب مرة أخرى لاحقاً أو تواصل معنا.';
  }
  if (rl === 'fa') {
    return 'نتونستیم درخواست رو کامل کنیم. چند لحظه دیگه دوباره امتحان کن یا با Estio تماس بگیر.';
  }
  return 'We could not complete that request. Please try again shortly or contact Estio.';
}

function fallbackShortAnswer(rl: AskReplyLocale): string {
  if (rl === 'ar') {
    return 'سأساعدك بسعادة — وضّح قليلاً ماذا تريد إنتاجه.';
  }
  if (rl === 'fa') {
    return 'بگو دقیقاً چی می‌خوای تولید کنی تا جلو بریم.';
  }
  return 'Happy to help — say a bit more about what you want to produce.';
}

function offerForIntent(
  intent: 'images' | 'video' | 'brand',
  rl: AskReplyLocale,
): string {
  if (rl === 'ar') return ASK_OFFER_BY_INTENT_AR[intent];
  if (rl === 'fa') return ASK_OFFER_BY_INTENT_FA[intent];
  return ASK_OFFER_BY_INTENT[intent];
}

function primaryCtaForIntent(
  intent: 'images' | 'video' | 'brand',
  rl: AskReplyLocale,
): string {
  if (rl === 'ar') return ASK_CTA_BY_INTENT_AR[intent];
  if (rl === 'fa') return ASK_CTA_BY_INTENT_FA[intent];
  return ASK_CTA_BY_INTENT[intent];
}

const DISABLED_ANSWER_EN =
  'Ask Estio AI is temporarily unavailable. For AI Studio image production, video, or brand systems, please use the offer links above or contact Estio directly.';
const DISABLED_ANSWER_AR =
  'مساعد "اسأل Estio AI" غير متاح مؤقتاً. لخدمات الاستوديو، استخدم الروابط أعلاه أو تواصل مع Estio.';

const OUT_OF_SCOPE_EN =
  'Ask Estio AI helps scope AI Image Production, Short-form AI Video, and Brand AI System work. For anything else, please contact Estio directly.';
const OUT_OF_SCOPE_AR =
  'يساعدك هذا المساعد في تحديد نطاق إنتاج الصور أو الفيديو أو نظام العلامة فقط. لغير ذلك، تواصل مع Estio مباشرة.';

const RATE_MSG_EN =
  'Too many questions in a short time. Please wait a few minutes or contact Estio using the link below.';
const RATE_MSG_AR =
  'طلبات كثيرة في وقت قصير. يرجى الانتظار قليلاً أو التواصل عبر الرابط أدناه.';

function envBool(v: string | undefined, defaultVal: boolean): boolean {
  if (v == null || v === '') return defaultVal;
  return ['1', 'true', 'yes', 'on'].includes(v.trim().toLowerCase());
}

function sanitizeMessage(raw: string): string {
  return raw
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 500);
}

function clampAnswer(s: string, max = 550): string {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

function normalizeIntent(v: unknown): NormalizedIntent {
  const x = String(v ?? '')
    .trim()
    .toLowerCase();
  if (x === 'images' || x === 'image') return 'images';
  if (x === 'video' || x === 'videos') return 'video';
  if (x === 'brand' || x === 'pack' || x === 'packs') return 'brand';
  if (INTENTS.includes(x as NormalizedIntent)) return x as NormalizedIntent;
  return 'unknown';
}

function productionIntentFromContext(
  intent: string | undefined,
): 'images' | 'video' | 'brand' | null {
  if (intent === 'images' || intent === 'video' || intent === 'brand') {
    return intent;
  }
  return null;
}

function parseModelJson(content: string): ModelShape | null {
  try {
    const parsed = JSON.parse(content) as ModelShape;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    const m = content.match(/\{[\s\S]*\}/);
    if (!m) return null;
    try {
      return JSON.parse(m[0]) as ModelShape;
    } catch {
      return null;
    }
  }
}

function ipKeyFromRequest(req: Request): string {
  const xf = req.headers['x-forwarded-for'];
  const raw =
    typeof xf === 'string'
      ? xf.split(',')[0]?.trim()
      : Array.isArray(xf)
        ? xf[0]
        : req.ip || req.socket.remoteAddress || 'unknown';
  const salt = process.env.ASK_ESTIO_AI_IP_SALT ?? 'estio-ask-salt';
  return createHash('sha256')
    .update(`${salt}:${raw}`)
    .digest('hex')
    .slice(0, 48);
}

function lastAssistantFromHistory(
  history: { role: string; content: string }[] | undefined,
): string {
  if (!history?.length) return '';
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === 'assistant') return history[i].content.trim();
  }
  return '';
}

function tokenSetJaccard(a: string, b: string): number {
  const tok = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2),
    );
  const A = tok(a);
  const B = tok(b);
  if (A.size === 0 && B.size === 0) return 1;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  const union = A.size + B.size - inter;
  return union ? inter / union : 0;
}

function assistantSignatureHash(text: string): string {
  return createHash('sha256')
    .update(text.trim().toLowerCase().slice(0, 2000))
    .digest('hex')
    .slice(0, 24);
}

function postConfirmationHandoffMessage(
  rl: AskReplyLocale,
  intent: 'images' | 'video' | 'brand',
  useCase: string | undefined,
  stage: ReturnType<typeof normalizeClientFlowStage>,
): string {
  const uc = useCase?.trim();
  const ucEn = uc ? ` for your ${uc}` : '';
  const ucAr = uc ? ` لـ${uc}` : '';
  const ucFa = uc ? ` برای ${uc}` : '';

  if (stage === 'action') {
    switch (rl) {
      case 'en':
        return `Great — you're all set.\nUse the buttons below to start production or request a scoped quote.`;
      case 'ar':
        return `تمام — جاهزين.\nاستخدم الأزرار أدناه للبدء أو لطلب عرض سريع.`;
      case 'fa':
        return `عالی — آماده‌ای.\nاز دکمه‌های پایین برای شروع تولید یا درخواست برآورد استفاده کن.`;
    }
  }

  switch (rl) {
    case 'en':
      if (intent === 'video') {
        return `Perfect — I'll line up a scoped quote${ucEn}.\nUse the buttons below to start short-form video or request a quick quote.`;
      }
      if (intent === 'brand') {
        return `Perfect — let's move this into a scoped quote${ucEn}.\nUse the buttons below to start your brand system or request a quote.`;
      }
      return `Perfect — I'll put together a quick quote${ucEn}.\nUse the buttons below to start with visuals or request a scoped quote.`;
    case 'ar':
      return `ممتاز — أجهز لك عرض سريع${ucAr}.\nاستخدم الأزرار أدناه للبدء أو لطلب برآورد.`;
    case 'fa':
      return `عالی — برات یه برآورد سریع می‌چینم${ucFa}.\nاز دکمه‌ها برای شروع تولید یا درخواست برآورد استفاده کن.`;
  }
}

@Injectable()
export class AskEstioAiService {
  private readonly log = new Logger(AskEstioAiService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly deepseek: DeepseekAskClient,
    private readonly rateLimit: AskEstioAiRateLimitService,
  ) {}

  isApiEnabled(): boolean {
    return envBool(process.env.ASK_ESTIO_AI_ENABLED, false);
  }

  async ask(dto: AiStudioAskDto, req: Request) {
    const ipHash = ipKeyFromRequest(req);
    const message = sanitizeMessage(dto.message);
    if (!message) {
      throw new BadRequestException({ error: 'empty_message' });
    }

    const turnCount = Math.min(50, Math.max(0, dto.turnCount ?? 0));
    const serverDetected = detectUserMessageLanguage(message);
    const replyLocale = resolveAskReplyLocale(dto, serverDetected);

    const rl = this.rateLimit.check({
      sessionId: dto.sessionId,
      ipKey: ipHash,
    });
    const askEnabledEffective = this.isApiEnabled();
    const deepseekKeyPresent = Boolean(process.env.DEEPSEEK_API_KEY?.trim());
    this.log.log(
      `[AskEstioAi debug] ASK_ESTIO_AI_ENABLED effective=${askEnabledEffective}, DEEPSEEK_API_KEY present=${deepseekKeyPresent}`,
    );

    if (rl) {
      const rateAns = rateLimitedAnswer(replyLocale);
      const row = await this.prisma.aiStudioAskEvent.create({
        data: {
          sessionId: dto.sessionId.slice(0, 80),
          page: dto.page.slice(0, 64),
          locale: dto.locale,
          userMessage: message,
          normalizedIntent: 'unknown',
          responseText: rateAns,
          source: dto.source?.slice(0, 64) ?? null,
          url: dto.url?.slice(0, 2000) ?? null,
          ipHash,
          rateLimited: true,
          outOfScope: false,
          shouldEscalate: true,
        },
      });
      return {
        answer: rateAns,
        intent: 'unknown' as const,
        recommendedOffer: null,
        recommendedCta: null,
        secondaryCta: {
          label: contactLabel(replyLocale),
          href: '/contact?interest=AI_STUDIO',
        },
        tokensUsed: undefined,
        logId: row.id,
        rateLimited: true,
      };
    }

    if (!this.isApiEnabled()) {
      this.log.log(
        '[AskEstioAi debug] Returning disabled fallback (ASK_ESTIO_AI_ENABLED is not true)',
      );
      const disAns = disabledAnswer(replyLocale);
      const row = await this.prisma.aiStudioAskEvent.create({
        data: {
          sessionId: dto.sessionId.slice(0, 80),
          page: dto.page.slice(0, 64),
          locale: dto.locale,
          userMessage: message,
          normalizedIntent: 'unknown',
          responseText: disAns,
          source: dto.source?.slice(0, 64) ?? null,
          url: dto.url?.slice(0, 2000) ?? null,
          ipHash,
          disabledFallback: true,
          shouldEscalate: true,
        },
      });
      return {
        answer: disAns,
        intent: 'unknown' as const,
        recommendedOffer: null,
        recommendedCta: null,
        secondaryCta: {
          label: contactLabel(replyLocale),
          href: '/contact?interest=AI_STUDIO',
        },
        tokensUsed: undefined,
        logId: row.id,
        disabled: true,
      };
    }

    const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
    if (!apiKey) {
      this.log.error('DEEPSEEK_API_KEY missing while ASK_ESTIO_AI_ENABLED=true');
      throw new ServiceUnavailableException({ error: 'ask_estio_ai_misconfigured' });
    }

    const baseUrl =
      process.env.DEEPSEEK_BASE_URL?.trim() || 'https://api.deepseek.com/v1';
    const model =
      process.env.DEEPSEEK_MODEL?.trim() || 'deepseek-chat';

    const normalizedStage = normalizeClientFlowStage(dto.context?.stage);
    const confirmationDetected = detectUserConfirmation(message);
    const prevAssistantText = lastAssistantFromHistory(dto.history);
    const prevAssistantSig = prevAssistantText
      ? assistantSignatureHash(prevAssistantText)
      : '(none)';

    const ctx = dto.context;
    const hasProdIntent =
      ctx?.intent === 'images' ||
      ctx?.intent === 'video' ||
      ctx?.intent === 'brand';
    const hasUseCase = Boolean(ctx?.useCase?.trim());
    const hasPlat = Boolean(ctx?.platform?.trim());
    const contextRichForConfirm =
      hasProdIntent &&
      (hasUseCase ||
        hasPlat ||
        normalizedStage === 'ready' ||
        normalizedStage === 'action');
    const confirmationAdvance =
      confirmationDetected && contextRichForConfirm;

    const ctxProd = productionIntentFromContext(dto.context?.intent);
    const useDeterministicConfirm =
      confirmationAdvance &&
      ctxProd != null &&
      (normalizedStage === 'ready' || normalizedStage === 'action');

    const confirmOpts = {
      confirmationAdvance,
      normalizedStage,
    };
    const forceProductionCta = computeForceProductionCta(
      dto,
      turnCount,
      confirmOpts,
    );
    const terminalNoQuestions =
      turnCount >= 5 ||
      (confirmationAdvance &&
        (normalizedStage === 'ready' || normalizedStage === 'action'));

    this.log.log(
      `[AskEstioAi funnel] stage=${normalizedStage} turnCount=${turnCount} confirmationDetected=${confirmationDetected} confirmationAdvance=${confirmationAdvance} useDeterministicConfirm=${useDeterministicConfirm} prevAssistantSig=${prevAssistantSig} forceProductionCta=${forceProductionCta} terminalNoQuestions=${terminalNoQuestions} replyLocale=${replyLocale} detected=${serverDetected} threadScroll=n/a(server)`,
    );

    if (useDeterministicConfirm) {
      const intent = ctxProd;
      let answer = postConfirmationHandoffMessage(
        replyLocale,
        intent,
        ctx?.useCase?.trim() ? ctx.useCase : undefined,
        normalizedStage,
      );
      answer = clampAnswer(answer);

      const recommendedOffer = offerForIntent(intent, replyLocale);
      const recommendedCta = {
        label: primaryCtaForIntent(intent, replyLocale).slice(0, 120),
        intent,
      } as const;
      const secondaryCta = {
        label: scopedQuoteCta(replyLocale),
        href: '/contact?interest=AI_STUDIO',
      };

      const row = await this.prisma.aiStudioAskEvent.create({
        data: {
          sessionId: dto.sessionId.slice(0, 80),
          page: dto.page.slice(0, 64),
          locale: dto.locale,
          userMessage: message,
          normalizedIntent: intent,
          recommendedOffer,
          recommendedCtaLabel: recommendedCta.label,
          secondaryCtaLabel: secondaryCta.label,
          responseText: answer,
          source: dto.source?.slice(0, 64) ?? null,
          url: dto.url?.slice(0, 2000) ?? null,
          ipHash,
          tokensUsed: null,
          outOfScope: false,
          shouldEscalate: false,
        },
      });

      return {
        answer,
        intent,
        recommendedOffer,
        recommendedCta,
        secondaryCta,
        tokensUsed: undefined,
        logId: row.id,
      };
    }

    const toneCtx = buildToneContext(req, dto, replyLocale);
    const confirmationHandoffLlm =
      confirmationAdvance && !useDeterministicConfirm;

    this.log.log(
      `[AskEstioAi debug] toneCtx=${JSON.stringify(toneCtx)} confirmationHandoffLLM=${confirmationHandoffLlm} cf-ipcountry=${String(req.headers['cf-ipcountry'] ?? '')}`,
    );
    const system = buildAskEstioAiSystemPrompt(toneCtx, {
      forceProductionCta,
      terminalNoQuestions,
      turnCount,
      detectedLanguageLabel: serverDetected,
      confirmationHandoff: confirmationHandoffLlm,
    });

    const historyBlock = formatAskHistoryForUserPrompt(dto.history);
    const sessionCtxBlock = formatAskSessionContextForUserPrompt(dto.context);
    const pageLoc = dto.pageLocale ?? dto.locale;
    const userParts: string[] = [];
    if (historyBlock) userParts.push(historyBlock);
    if (sessionCtxBlock) userParts.push(sessionCtxBlock);
    userParts.push(`Page locale (site UI only): ${pageLoc}`);
    userParts.push(`Server detectedLanguage (latest user message): ${serverDetected}`);
    if (dto.detectedLanguage) {
      userParts.push(`Client detectedLanguage hint: ${dto.detectedLanguage}`);
    }
    userParts.push(`Session flow stage (client): ${normalizedStage}`);
    userParts.push(
      `confirmationDetected (server): ${confirmationDetected}; confirmationAdvance: ${confirmationAdvance}`,
    );
    userParts.push(`turnCount (completed user→assistant rounds before this message): ${turnCount}`);
    userParts.push(`Tone context: ${JSON.stringify(toneCtx)}`);
    userParts.push(`Latest user message: ${JSON.stringify(message)}`);
    userParts.push(
      `Classify and respond. Write JSON "message" in the RESPONSE LANGUAGE from the system prompt (not the page locale).`,
    );
    userParts.push(`Return JSON only.`);
    const user = userParts.join('\n\n');

    let content = '';
    let tokensUsed: number | undefined;
    try {
      this.log.log('[AskEstioAi debug] Calling DeepSeek chat completion');
      const out = await this.deepseek.complete({
        system,
        user,
        model,
        baseUrl,
        apiKey,
      });
      content = out.content;
      tokensUsed = out.tokensUsed;
    } catch (e) {
      this.log.warn(`DeepSeek call failed: ${e instanceof Error ? e.message : e}`);
      const fallback = deepseekFailureAnswer(replyLocale);
      const row = await this.prisma.aiStudioAskEvent.create({
        data: {
          sessionId: dto.sessionId.slice(0, 80),
          page: dto.page.slice(0, 64),
          locale: dto.locale,
          userMessage: message,
          normalizedIntent: 'unknown',
          responseText: fallback,
          source: dto.source?.slice(0, 64) ?? null,
          url: dto.url?.slice(0, 2000) ?? null,
          ipHash,
          tokensUsed: undefined,
          outOfScope: false,
          shouldEscalate: true,
        },
      });
      return {
        answer: fallback,
        intent: 'unknown' as const,
        recommendedOffer: null,
        recommendedCta: null,
        secondaryCta: {
          label: contactLabel(replyLocale),
          href: '/contact?interest=AI_STUDIO',
        },
        tokensUsed: undefined,
        logId: row.id,
      };
    }

    const parsed = parseModelJson(content);
    let intent = normalizeIntent(parsed?.intent);
    const modelOutOfScope = Boolean(parsed?.outOfScope);
    if (modelOutOfScope) {
      intent = 'unknown';
    }

    if (
      forceProductionCta &&
      !modelOutOfScope &&
      intent === 'unknown' &&
      ctxProd != null
    ) {
      intent = ctxProd;
    }

    let rawReply =
      typeof parsed?.message === 'string' && parsed.message.trim()
        ? parsed.message.trim()
        : typeof parsed?.answer === 'string' && parsed.answer.trim()
          ? parsed.answer.trim()
          : '';

    const sim =
      prevAssistantText.length > 40 && rawReply.length > 40
        ? tokenSetJaccard(prevAssistantText, rawReply)
        : 0;
    let dedupApplied = false;
    if (sim >= 0.72) {
      if (
        ctxProd != null &&
        (intent === 'unknown' || intent === ctxProd)
      ) {
        rawReply = postConfirmationHandoffMessage(
          replyLocale,
          ctxProd,
          ctx?.useCase?.trim() ? ctx.useCase : undefined,
          normalizedStage === 'action' ? 'action' : 'ready',
        );
        intent = ctxProd;
        dedupApplied = true;
      } else if (
        intent === 'images' ||
        intent === 'video' ||
        intent === 'brand'
      ) {
        rawReply = postConfirmationHandoffMessage(
          replyLocale,
          intent,
          ctx?.useCase?.trim() ? ctx.useCase : undefined,
          normalizedStage === 'action' ? 'action' : 'ready',
        );
        dedupApplied = true;
      }
    }
    this.log.log(
      `[AskEstioAi funnel] simJaccard=${sim.toFixed(3)} dedupApplied=${dedupApplied}`,
    );

    const shouldEscalate =
      Boolean(parsed?.shouldEscalateToContact) ||
      modelOutOfScope ||
      (intent === 'unknown' && !forceProductionCta);

    let recommendedOffer: string | null =
      typeof parsed?.recommendedOffer === 'string'
        ? parsed.recommendedOffer.trim().slice(0, 256)
        : null;

    if (intent === 'images' || intent === 'video' || intent === 'brand') {
      if (!recommendedOffer) {
        recommendedOffer = offerForIntent(intent, replyLocale);
      }
    }

    const fallbackShort = fallbackShortAnswer(replyLocale);

    const postConfirmationShort =
      confirmationAdvance &&
      (normalizedStage === 'ready' || normalizedStage === 'action');
    const normOpts = {
      forceProductionCta,
      terminalNoQuestions,
      postConfirmationShort,
    };
    let answer: string;
    if (intent === 'unknown') {
      if (rawReply) {
        answer = normalizeAskMessage(rawReply, toneCtx, intent, normOpts);
        answer = clampAnswer(answer);
      } else {
        answer = clampAnswer(outOfScopeAnswer(replyLocale));
      }
    } else {
      const base = rawReply || fallbackShort;
      answer = normalizeAskMessage(base, toneCtx, intent, normOpts);
      answer = clampAnswer(answer);
    }

    const ctaLabelRaw =
      typeof parsed?.recommendedCtaLabel === 'string'
        ? parsed.recommendedCtaLabel.trim()
        : '';

    let recommendedCta: {
      label: string;
      intent: 'images' | 'video' | 'brand' | null;
    } | null = null;

    if (intent === 'images' || intent === 'video' || intent === 'brand') {
      recommendedCta = {
        label: (
          ctaLabelRaw || primaryCtaForIntent(intent, replyLocale)
        ).slice(0, 120),
        intent,
      };
    } else if (shouldEscalate || intent === 'unknown') {
      recommendedCta = {
        label: (
          ctaLabelRaw || scopedQuoteCta(replyLocale)
        ).slice(0, 120),
        intent: null,
      };
    }

    const secondaryCta = {
      label: scopedQuoteCta(replyLocale),
      href: '/contact?interest=AI_STUDIO',
    };

    const row = await this.prisma.aiStudioAskEvent.create({
      data: {
        sessionId: dto.sessionId.slice(0, 80),
        page: dto.page.slice(0, 64),
        locale: dto.locale,
        userMessage: message,
        normalizedIntent: intent,
        recommendedOffer,
        recommendedCtaLabel: recommendedCta?.label ?? null,
        secondaryCtaLabel: secondaryCta.label,
        responseText: answer,
        source: dto.source?.slice(0, 64) ?? null,
        url: dto.url?.slice(0, 2000) ?? null,
        ipHash,
        tokensUsed: tokensUsed ?? null,
        outOfScope: intent === 'unknown' || modelOutOfScope,
        shouldEscalate: shouldEscalate || intent === 'unknown',
      },
    });

    return {
      answer,
      intent,
      recommendedOffer,
      recommendedCta,
      secondaryCta,
      tokensUsed,
      logId: row.id,
    };
  }

  async recordInteraction(dto: AskInteractionDto) {
    const data =
      dto.kind === 'primary_cta'
        ? { primaryCtaClicked: true }
        : { secondaryCtaClicked: true };
    await this.prisma.aiStudioAskEvent.updateMany({
      where: {
        id: dto.logId,
        sessionId: dto.sessionId.slice(0, 80),
      },
      data,
    });
    return { ok: true };
  }

  async getAdminSummary(days: number) {
    const d = Math.min(90, Math.max(1, Math.floor(days) || 30));
    const from = new Date(Date.now() - d * 86_400_000);
    const rows = await this.prisma.aiStudioAskEvent.findMany({
      where: { createdAt: { gte: from } },
      select: {
        normalizedIntent: true,
        userMessage: true,
        outOfScope: true,
        rateLimited: true,
        primaryCtaClicked: true,
        secondaryCtaClicked: true,
        shouldEscalate: true,
        createdAt: true,
      },
    });
    const total = rows.length;
    const intentCounts: Record<string, number> = {};
    const promptCounts: Record<string, number> = {};
    let outOfScope = 0;
    let rateLimited = 0;
    let primaryCta = 0;
    let secondaryCta = 0;
    for (const r of rows) {
      intentCounts[r.normalizedIntent] = (intentCounts[r.normalizedIntent] ?? 0) + 1;
      const key = r.userMessage.trim().slice(0, 80).toLowerCase();
      if (key) promptCounts[key] = (promptCounts[key] ?? 0) + 1;
      if (r.outOfScope) outOfScope++;
      if (r.rateLimited) rateLimited++;
      if (r.primaryCtaClicked) primaryCta++;
      if (r.secondaryCtaClicked) secondaryCta++;
    }
    const topIntents = Object.entries(intentCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([intent, count]) => ({ intent, count }));
    const topPrompts = Object.entries(promptCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([prompt, count]) => ({ prompt, count }));
    return {
      periodDays: d,
      fromIso: from.toISOString(),
      totalAsks: total,
      topIntents,
      topPrompts,
      outOfScopeRate: total ? outOfScope / total : 0,
      rateLimitedCount: rateLimited,
      primaryCtaClicks: primaryCta,
      secondaryCtaClicks: secondaryCta,
      escalationSignals: rows.filter((r) => r.shouldEscalate).length,
    };
  }

  /** Ask Estio AI analytics for admin UI — read-only aggregates over `AiStudioAskEvent`. */
  async getAdminInsights(days: number) {
    const d = Math.min(90, Math.max(1, Math.floor(days) || 30));
    const from = new Date(Date.now() - d * 86_400_000);
    const cap = 25_000;

    const [liveRows, aggRows] = await Promise.all([
      this.prisma.aiStudioAskEvent.findMany({
        where: { createdAt: { gte: from } },
        orderBy: { createdAt: 'desc' },
        take: 20,
        select: {
          userMessage: true,
          normalizedIntent: true,
          outOfScope: true,
          primaryCtaClicked: true,
          secondaryCtaClicked: true,
          sessionId: true,
          createdAt: true,
        },
      }),
      this.prisma.aiStudioAskEvent.findMany({
        where: { createdAt: { gte: from } },
        select: {
          userMessage: true,
          normalizedIntent: true,
          outOfScope: true,
          primaryCtaClicked: true,
          secondaryCtaClicked: true,
        },
        take: cap,
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    const normalizeQuestionKey = (msg: string): string => {
      const s = msg
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 200);
      return s || '(empty)';
    };

    const questionBuckets = new Map<
      string,
      { count: number; example: string }
    >();
    const oosBuckets = new Map<
      string,
      { count: number; example: string }
    >();
    const intentCounts: Record<string, number> = {};
    const intentCta: Record<string, { asks: number; cta: number }> = {};

    for (const r of aggRows) {
      const intent = r.normalizedIntent || 'unknown';
      intentCounts[intent] = (intentCounts[intent] ?? 0) + 1;
      if (!intentCta[intent]) intentCta[intent] = { asks: 0, cta: 0 };
      intentCta[intent].asks++;
      if (r.primaryCtaClicked || r.secondaryCtaClicked) {
        intentCta[intent].cta++;
      }

      const key = normalizeQuestionKey(r.userMessage);
      const q = questionBuckets.get(key);
      if (q) q.count++;
      else questionBuckets.set(key, { count: 1, example: r.userMessage.trim().slice(0, 280) });

      if (r.outOfScope) {
        const o = oosBuckets.get(key);
        if (o) o.count++;
        else oosBuckets.set(key, { count: 1, example: r.userMessage.trim().slice(0, 280) });
      }
    }

    const canonical = ['images', 'video', 'brand', 'unknown'] as const;
    const known = new Set<string>(canonical);
    const extraIntents = Object.keys(intentCounts).filter((i) => !known.has(i));
    extraIntents.sort();

    const intentDistribution = [
      ...canonical.map((intent) => ({
        intent,
        count: intentCounts[intent] ?? 0,
      })),
      ...extraIntents.map((intent) => ({
        intent,
        count: intentCounts[intent] ?? 0,
      })),
    ];
    const maxIntent = Math.max(1, ...intentDistribution.map((x) => x.count));

    const conversionByIntent = [
      ...canonical.map((intent) => {
        const row = intentCta[intent] ?? { asks: 0, cta: 0 };
        return {
          intent,
          asks: row.asks,
          ctaClicked: row.cta,
          rate: row.asks ? row.cta / row.asks : 0,
        };
      }),
      ...extraIntents.map((intent) => {
        const row = intentCta[intent] ?? { asks: 0, cta: 0 };
        return {
          intent,
          asks: row.asks,
          ctaClicked: row.cta,
          rate: row.asks ? row.cta / row.asks : 0,
        };
      }),
    ];

    const topQuestions = [...questionBuckets.entries()]
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 25)
      .map(({ example, count }) => ({ example, count }));

    const topOutOfScope = [...oosBuckets.entries()]
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
      .map(({ example, count }) => ({ example, count }));

    const liveFeed = liveRows.map((r) => ({
      userMessage: r.userMessage,
      intent: r.normalizedIntent,
      outOfScope: r.outOfScope,
      ctaClicked: r.primaryCtaClicked || r.secondaryCtaClicked,
      sessionId: r.sessionId,
      createdAt: r.createdAt.toISOString(),
    }));

    return {
      periodDays: d,
      fromIso: from.toISOString(),
      sampleTruncated: aggRows.length >= cap,
      sampleSize: aggRows.length,
      topQuestions,
      intentDistribution,
      maxIntentCount: maxIntent,
      conversionByIntent,
      topOutOfScope,
      liveFeed,
    };
  }
}
