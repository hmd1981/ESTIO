import type { AiStudioFunnelOpenDetail } from "./constants";

export type FunnelIntent = AiStudioFunnelOpenDetail["intent"];

export type QuoteResult = {
  estimateMid: number;
  low: number;
  high: number;
  displayRange: string;
  breakdown: { base: number; perUnit?: number; quantity: number };
};

export function computeQuote(
  intent: FunnelIntent,
  quantity: number | undefined,
): QuoteResult {
  const q = Math.max(1, Math.min(quantity ?? 4, 50));
  if (intent === "images") {
    const base = 150;
    const perImage = 20;
    const mid = base + q * perImage;
    const low = base;
    const high = base + q * perImage + 80;
    return {
      estimateMid: mid,
      low,
      high,
      displayRange: `$${low}–$${high} depending on scope`,
      breakdown: { base, perUnit: perImage, quantity: q },
    };
  }
  if (intent === "video") {
    const base = 250;
    const low = base;
    const high = base + 200;
    return {
      estimateMid: base,
      low,
      high,
      displayRange: `$${low}–$${high} depending on scope`,
      breakdown: { base, quantity: 1 },
    };
  }
  const base = 400;
  const low = base;
  const high = base + 400;
  return {
    estimateMid: base,
    low,
    high,
    displayRange: `$${low}–$${high} depending on scope`,
    breakdown: { base, quantity: 1 },
  };
}
