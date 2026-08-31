const API_BASE = "/api";

export type AiJobType =
  | "text_to_image"
  | "text_to_video"
  | "text_to_brand"
  | "brand_visual_system";

export type CreateJobBody = {
  type: AiJobType;
  input: {
    prompt?: string;
    description?: string;
    referenceImage?: string;
    platform?: string;
    quantity?: number;
  };
};

export type JobStatusResponse = {
  status: "queued" | "active" | "completed" | "failed" | "unknown";
  assets: string[];
  error?: string;
};

export async function createAiJob(body: CreateJobBody): Promise<{ id: string }> {
  const res = await fetch(`${API_BASE}/ai/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `HTTP ${res.status}`);
  }
  return (await res.json()) as { id: string };
}

export async function getAiJob(id: string): Promise<JobStatusResponse> {
  const res = await fetch(`${API_BASE}/ai/jobs/${encodeURIComponent(id)}`);
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `HTTP ${res.status}`);
  }
  return (await res.json()) as JobStatusResponse;
}

export function intentToJobType(intent: "images" | "video" | "brand"): AiJobType {
  if (intent === "images") return "text_to_image";
  if (intent === "video") return "text_to_video";
  return "text_to_brand";
}
