import type { FunnelIntent } from "./pricing";

export type FunnelStage =
  | "idle"
  | "intent"
  | "preview"
  | "quote"
  | "lead"
  | "done";

export type FunnelStateV3 = {
  intent: FunnelIntent | null;
  stage: FunnelStage;
  inputs: {
    prompt?: string;
    referenceImage?: string;
    platform?: "instagram" | "ads" | "landing" | null;
    quantity?: number;
  };
  preview: {
    status: "idle" | "loading" | "ready" | "error";
    assets: string[];
    jobId?: string;
    errorMessage?: string;
  };
  quote: {
    estimate?: number;
    breakdown?: Record<string, unknown>;
    displayRange?: string;
  };
};

const STORAGE_KEY = "estio-ai-studio-funnel-v3";

export const defaultFunnelStateV3 = (): FunnelStateV3 => ({
  intent: null,
  stage: "idle",
  inputs: {},
  preview: { status: "idle", assets: [] },
  quote: {},
});

export function loadFunnelStateV3(): FunnelStateV3 {
  if (typeof window === "undefined") return defaultFunnelStateV3();
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultFunnelStateV3();
    const p = JSON.parse(raw) as Partial<FunnelStateV3>;
    return {
      ...defaultFunnelStateV3(),
      ...p,
      inputs: { ...defaultFunnelStateV3().inputs, ...p.inputs },
      preview: { ...defaultFunnelStateV3().preview, ...p.preview },
      quote: { ...defaultFunnelStateV3().quote, ...p.quote },
    };
  } catch {
    return defaultFunnelStateV3();
  }
}

export function saveFunnelStateV3(state: FunnelStateV3): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* noop */
  }
}
